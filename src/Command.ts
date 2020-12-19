import {ApplicationCommand, ApplicationCommandOptions, InteractionHandler, InteractionType, Snowflake} from "./types";

export class Command<N extends string, O extends ApplicationCommandOptions> implements ApplicationCommand<N, InteractionType.ApplicationCommand, O> {
    public readonly type = InteractionType.ApplicationCommand;
    public id?: Snowflake;
    
    public constructor(public readonly name: N, public readonly description: string, public readonly options: O, public readonly handler: InteractionHandler<N, InteractionType.ApplicationCommand, O>, public readonly guildIds?: Snowflake[]) {
    }
}
