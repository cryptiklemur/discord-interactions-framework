import express, {Request, Response} from 'express';
import {AbstractProcessor} from "./AbstractProcessor";
import {InteractionRequest, InteractionResponseType, InteractionType} from "../types";
import camelcaseKeys from "camelcase-keys";
import {verifyKey} from "discord-interactions";

export class ExpressProcessor extends AbstractProcessor<Request, Response> {
    public async isValidRequest(request: Request): Promise<boolean> {
        const signature = request.header('x-signature-ed25519');
        const timestamp = request.header('x-signature-timestamp');
        if (!signature || !timestamp) {
            return false;
        }
        console.log(request.body, signature, timestamp, this.config.publicKey)
        
        return verifyKey(request.body, signature, timestamp, this.config.publicKey);
    }
    
    public async processRequest(request: Request, response: Response): Promise<Response> {
        console.log('----------------------------------------------------------------\n\n\nNew Request ----------------------------------------------------------------')
        const isValid = await new Promise((resolve) => {
            express.text({type: () => true})(request, response, () => this.isValidRequest(request).then(resolve))
        })
        if (!isValid) {
            console.log('Invalid request', request.headers);
            return response.status(401).send('Bad request signature');
        }
    
        const jsonBody: InteractionRequest<any> = await this.parseBodyJson(request);
        if (jsonBody.type === InteractionType.Ping) {
            return response.status(200).send({type: InteractionResponseType.Pong});
        }
    
        const interaction = this.convertToInteraction(jsonBody);
        if (!this.registry.hasCommand(interaction.data.name)) {
            const error = new Error('Invalid command');
            (error as any).interaction = interaction;
        
            throw error;
        }
        
        return response
            .status(200)
            .json(this.registry.getCommand(interaction.data.name)!.handler(interaction));
    }
    
    public async parseBodyJson(request: Request): Promise<InteractionRequest<any>> {
        const json: InteractionRequest = camelcaseKeys(JSON.parse(request.body), {deep: true, stopPaths: ['data']});
        if (!!json.member) {
            json.member.premiumSince = json.member.premiumSince ? new Date(json.member.premiumSince) : undefined;
            json.member.joinedAt = new Date(json.member.joinedAt);
        }
    
        return json;
    }
}
