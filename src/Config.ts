import {Config as ConfigInterface} from './types';

export class Config implements ConfigInterface {
    readonly applicationId: string;
    authorization: { botToken?: string; bearerToken?: string };
    readonly publicKey: string;
    public constructor(init: ConfigInterface) {
        this.applicationId = init.applicationId;
        this.authorization = init.authorization;
        this.publicKey = init.publicKey;
    }
}
