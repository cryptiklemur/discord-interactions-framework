import axios, {AxiosRequestConfig} from 'axios';
import EventEmitter from 'eventemitter3';
import {
    ApplicationCommand,
    ApplicationCommandOptionChoices,
    ApplicationCommandOptions,
    Config, InteractionType,
    RegisterCommandInterface
} from "./types";

const debug = require('debug')('discord-interactions-framework:registry')


export class Registry extends EventEmitter {
    private readonly baseUrl = 'https://discord.com/api/v8/applications/';
    
    public constructor(protected config: Config, protected commands: ApplicationCommand<any, any, any>[]) {
        super();
        this.baseUrl += config.applicationId;
    }
    
    public hasCommand<N extends string>(name: N): boolean {
        return !!this.commands.find((x) => x.name === name);
    }
    
    public getCommand<N extends string>(name: N): ApplicationCommand<N, InteractionType.ApplicationCommand, any> | undefined {
        return this.commands.find((x) => x.name === name);
    }
    
    public async initialize(delay = 1000) {
        const requests = this.commands.map(this.upsertCommand.bind(this)).flat();
        for (const request of requests) {
            try {
                const response = await axios.request(request);
                this.emit('upsert-command', request, response);
            } catch (e) {
                this.emit('upsert-command-error', request, e);
                debug('Error Upserting Command: %O', e);
                this.emit('error', e);
            }
            await new Promise((r) => setTimeout(r, delay));
        }
        
    }
    
    private upsertCommand({name, description, options, guildIds}: ApplicationCommand): AxiosRequestConfig[] {
        function mapChoices(choices?: ApplicationCommandOptionChoices) {
            if (!choices) {
                return undefined;
            }
            
            return Object.entries(choices ?? {}).map(([k, v]) => ({
                name: k,
                value: v,
            }));
        }
        
        function mapOptions(options?: ApplicationCommandOptions): RegisterCommandInterface['options'] {
            if (!options) {
                return undefined;
            }
            
            return Object.entries(options ?? {}).map(([k, v]) => ({
                name: k,
                ...v,
                choices: mapChoices(v.choices),
                options: mapOptions(v.options),
            }));
        }
        
        const method = 'POST';
        const data: RegisterCommandInterface = {name, description, options: mapOptions(options)};
        const headers = {
            'Content-Type': 'application/json',
            Authorization: this.config.authorization.bearerToken
                ? `Bearer ${this.config.authorization.bearerToken}`
                : `Bot ${this.config.authorization.botToken}`,
        };
        
        return guildIds !== undefined
            ? guildIds.map((guildId) => ({url: `${this.baseUrl}/guilds/${guildId}/commands`, method, data, headers}))
            : [{url: `${this.baseUrl}/commands`, method, data, headers}];
    }
}

