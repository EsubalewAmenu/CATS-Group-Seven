# smart-contract

Write validators in the `validators` folder, and supporting functions in the `lib` folder using `.ak` as a file extension.

```aiken
validator my_first_validator {
  spend(_datum: Option<Data>, _redeemer: Data, _output_reference: Data, _context: Data) {
    True
  }
}
```

## Building

```sh
aiken build
```

## Configuring

**aiken.toml**
```toml
[config.default]
network_id = 41
```

Or, alternatively, write conditional environment modules under `env`.

## Testing

You can write tests in any module using the `test` keyword. For example:

```aiken
use config

test foo() {
  config.network_id + 1 == 42
}
```

To run all tests, simply do:

```sh
aiken check
```

To run only tests matching the string `foo`, do:

```sh
aiken check -m foo
```

## Documentation

If you're writing a library, you might want to generate an HTML documentation for it.

Use:

```sh
aiken docs
```

## How to start the server

```
deno run --allow-net --allow-read --allow-env --allow-sys main.ts
```

## API body
POST request to http://localhost:8000/mint to mint new token with the below body

```
{
  "blockfrostKey": "preprod...",
  "secretSeed": "your seed phrase...",
  "tokenName": "MyAikenNFT",
  "metadata": { "name": "Aiken NFT #1", "image": "ipfs://..." },
  "cborHex": "5908..." // The 'compiledCode' string from aiken's plutus.json
}
```


## Resources

Find more on the [Aiken's user manual](https://aiken-lang.org).
