# Discord Interactions Framework

### Install

```shell
$ npm install discord-interactions-framerwork
// or
$ yarn add discord-interactions-framework
```

### Usage

```ts
const config = new Config({
    applicationId: '',
    publicKey: '',
    authorization: {
        botToken: '',
    }
});
const registry = new Registry(config, [
        new Command(
            'bar',
            'Test command',
            {
                foo: {
                    type: ApplicationCommandOptionType.String,
                    description: 'Foo value',
                    required: true,
                },
                baz: {
                    type: ApplicationCommandOptionType.String,
                    description: 'Baz value',
                    required: true,
                    choices: {Dog: 'animal_dog', Cat: 'animal_cat', Penguin: 'animal_penguin'},
                },
            } as const,
            (interaction) => {
                const a = interaction.data.options.foo.value;
                const b = interaction.data.options.baz.value;
                if (interaction.data.options.baz.value === 'animal_cat') {
                    return {type: 1};
                }
                
                return {type: 1};
            },
            ['81384788765712384']
        ),
    ]
);

async function main() {
    const processor = new ExpressProcessor(config, registry);
    const app = express();
    await registry.initialize();
    
    app.post('/', processor.processRequest.bind(processor));
    
    app.listen(3000)
}

main().then(() => console.log('Finished'), console.error)
```
