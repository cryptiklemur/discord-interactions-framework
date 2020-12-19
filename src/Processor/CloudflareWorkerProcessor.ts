import {AbstractProcessor} from "./AbstractProcessor";
import {verifyKey} from "discord-interactions";
import {InteractionRequest, InteractionResponseType, InteractionType} from "../types";
import camelcaseKeys from "camelcase-keys";

export class CloudflareWorkerProcessor extends AbstractProcessor<Request, Response> {
    public async isValidRequest(request: Request): Promise<boolean> {
        const signature = request.headers.get('x-signature-ed25519');
        const timestamp = request.headers.get('x-signature-timestamp');
        if (!signature || !timestamp || !request.body) {
            return false;
        }
        const rawBody = await request.clone().arrayBuffer();
        
        return verifyKey(rawBody, signature, timestamp, this.config.publicKey);
    }
    
    public async processRequest(request: Request, response?: Response): Promise<Response> {
        if (!await this.isValidRequest(request)) {
            return new Response('Bad request signature', {status: 401});
        }
        
        const jsonBody: InteractionRequest<any> = await this.parseBodyJson(request);
        if (jsonBody.type === InteractionType.Ping) {
            return new Response(JSON.stringify({type: InteractionResponseType.Pong}), {status: 200});
        }
        
        const interaction = this.convertToInteraction(jsonBody);
        if (!this.registry.hasCommand(interaction.data.name)) {
            const error = new Error('Invalid command');
            (error as any).interaction = interaction;
            
            throw error;
        }
        
        return new Response(
            JSON.stringify(this.registry.getCommand(interaction.data.name)!.handler(interaction)),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
    
    public async parseBodyJson(request: Request): Promise<InteractionRequest<any>> {
        const json: InteractionRequest = camelcaseKeys(await request.clone().json(), {deep: true, stopPaths: ['data']});
        if (!!json.member) {
            json.member.premiumSince = json.member.premiumSince ? new Date(json.member.premiumSince) : undefined;
            json.member.joinedAt = new Date(json.member.joinedAt);
        }
        
        return json;
    }
}
