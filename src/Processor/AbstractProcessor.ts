import {ProcessorInterface} from "./ProcessorInterface";
import {
    ApplicationCommandOptions,
    Config,
    Interaction,
    InteractionRequest, InteractionRequestDataOptions,
    InteractionType, Options
} from "../types";
import {Registry} from "../Registry";


export abstract class AbstractProcessor<Request, Response> implements ProcessorInterface<Request, Response> {
    public constructor(public readonly config: Config, public readonly registry: Registry) {
    }
    
    public abstract isValidRequest(request: Request): Promise<boolean>;
    
    public abstract processRequest(request: Request, response?: Response): Promise<Response>;
    
    public abstract parseBodyJson<T extends InteractionType = any>(request: Request): Promise<InteractionRequest<T>>;
    
    public convertToInteraction(json: InteractionRequest<InteractionType.ApplicationCommand>): Interaction<string, InteractionType.ApplicationCommand, ApplicationCommandOptions> {
        function reduceOptions(options?: InteractionRequestDataOptions[]): Options<ApplicationCommandOptions> {
            return options?.reduce((acc, next) => {
                acc[next.name as string] = {
                    value: next.value,
                    options: reduceOptions(next.options),
                } as any; // options may be never here. Hard to coerce this.
    
                return acc;
            }, {} as Options<ApplicationCommandOptions>) ?? {}
        }
        
        return {
            id: json.id,
            channelId: json.channelId,
            guildId: json.guildId,
            member: json.member,
            token: json.token,
            type: InteractionType.ApplicationCommand,
            data: {
                id: json.data!.id,
                name: json.data!.name,
                options: reduceOptions(json.data!.options)
            },
            version: 1
        };
    }
    
}
