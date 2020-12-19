
export type Snowflake = string;
export type ApplicationCommandOptions = { [key: string]: ApplicationCommandOption };
export type ApplicationCommandOptionChoices<T extends string | number = string | number> = { [key: string]: T };

export interface ApplicationCommand<N extends string = string, T extends InteractionType = InteractionType, O extends ApplicationCommandOptions = ApplicationCommandOptions> {
    readonly id?: Snowflake;
    readonly guildIds?: Snowflake[];
    readonly name: N;
    readonly type: T;
    readonly description: string;
    readonly options?: O;
    readonly handler: InteractionHandler<N, T, O>
}

export enum InteractionResponseType {
    Pong = 1,
    Acknowledge,
    ChannelMessage,
    ChannelMessageWithSource,
    ACKWithSource,
}

export enum InteractionResponseFlags {
    Ephemeral = 1 << 6,
}

export interface InteractionResponse {
    readonly type: InteractionResponseType;
    readonly data?: InteractionApplicationCommandCallbackData;
}

export interface InteractionApplicationCommandCallbackData {
    readonly tts?: boolean;
    readonly content: string;
    readonly embeds: Embed[];
    readonly flags?: InteractionResponseFlags | number;
    readonly allowedMentions?: AllowedMentions;
}

export interface Embed {
}

export interface AllowedMentions {
}

export type InteractionHandler<N extends string, T extends InteractionType, O extends ApplicationCommandOptions> = (interaction: Interaction<N, T, O>) => InteractionResponse;

export type Options<O extends ApplicationCommandOptions> = {
    [Key in keyof O]: O[Key]["required"] extends true ? ApplicationCommandInteractionDataOption<O[Key]> : ApplicationCommandInteractionDataOption<O[Key]> | undefined
}
export interface ApplicationCommandInteractionData<N extends string, O extends ApplicationCommandOptions> {
    readonly id: Snowflake;
    readonly name: N;
    readonly options: Options<O>;
}

export interface ApplicationCommandInteractionDataOption<O extends ApplicationCommandOption> {
    readonly value?: O["options"] extends ApplicationCommandOptions ? never : O["choices"] extends ApplicationCommandOptionChoices ? O["choices"][keyof O["choices"]] : string | number;
    readonly options: O["options"] extends ApplicationCommandOptions ? Options<O["options"]> : never;
}

export type DataType<N extends string, O extends ApplicationCommandOptions> = {
    [InteractionType.Ping]: undefined;
    [InteractionType.ApplicationCommand]: ApplicationCommandInteractionData<N, O>;
}

export interface Interaction<N extends string, T extends InteractionType, O extends ApplicationCommandOptions> {
    readonly id: Snowflake;
    readonly type: T;
    readonly data: DataType<N, O>[T];
    readonly guildId: string;
    readonly channelId: string;
    readonly member: GuildMember;
    readonly token: string;
    readonly version: 1;
}

export interface GuildMember {
    user: {
        id: Snowflake;
        username: string;
        avatar: string;
        discriminator: string;
        publicFlags: number;
    };
    roles: Snowflake[];
    premiumSince?: Date;
    permissions: string;
    pending: boolean;
    nick?: string;
    mute: boolean;
    joinedAt: Date;
    isPending: boolean;
    deaf: boolean;
}

export enum InteractionType {
    Ping = 1,
    ApplicationCommand,
}

export enum ApplicationCommandOptionType {
    SubCommand = 1,
    SubCommandGroup,
    String,
    Integer,
    Boolean,
    User,
    Channel,
    Role,
}

/**
 * @todo Force type to be SubCommandGroup if options is not undefined
 */
export interface ApplicationCommandOption<R extends true | false = true | false> {
    readonly type: ApplicationCommandOptionType;
    readonly description: string;
    readonly default?: boolean;
    readonly required?: R;
    readonly choices?: ApplicationCommandOptionChoices;
    readonly options?: ApplicationCommandOptions;
}

export interface Config {
    readonly applicationId: string;
    readonly publicKey: string;
    authorization: {
        botToken?: string;
        bearerToken?: string;
    },
}


export interface RegisterCommandInterface {
    name: string;
    description: string;
    options?: {
        type: ApplicationCommandOptionType;
        name: string;
        description: string;
        default?: boolean;
        required?: boolean;
        choices?: {
            name: string;
            value: string | number;
        }[];
        options?: RegisterCommandInterface['options'];
    }[];
}

export type RequestDataType<T> = {
    [InteractionType.Ping]: never;
    [InteractionType.ApplicationCommand]: T;
}

export interface InteractionRequestDataOptions {
    name: string;
    value?: string | number;
    options?: InteractionRequestDataOptions[];
}

export interface InteractionRequest<T extends InteractionType = InteractionType> {
    readonly id: Snowflake;
    readonly type: T;
    readonly guildId: Snowflake;
    readonly channelId: Snowflake;
    readonly member: GuildMember;
    readonly token: string;
    readonly version: 1;
    readonly data?: RequestDataType<{
        id: Snowflake;
        name: string;
        options?: InteractionRequestDataOptions[];
    }>[T]
}
