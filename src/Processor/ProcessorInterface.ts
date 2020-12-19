import {ApplicationCommandOptions, Config, Interaction, InteractionRequest, InteractionType} from "../types";
import {Registry} from "../Registry";

export interface ProcessorInterface<Request, Response> {
    readonly config: Config;
    readonly registry: Registry;
    
    isValidRequest(request: Request): Promise<boolean>;
    
    processRequest(request: Request, response?: Response): Promise<Response>;
    
    parseBodyJson<T extends InteractionType = any>(request: Request): Promise<InteractionRequest<T>>;
    
    convertToInteraction(json: InteractionRequest<InteractionType.ApplicationCommand>): Interaction<string, InteractionType.ApplicationCommand, ApplicationCommandOptions>;
}
