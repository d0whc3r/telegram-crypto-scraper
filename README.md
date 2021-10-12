# Telegram crypto scraper

Telegram crypto scraper is a software to extract cornix messages to know if a cyrpto signals channel is profitable
It can also extract messages from cornix notification bot to know if your investment is profitable

### Obtaining your `API ID` and `Hash`

1. Follow [this link](https://my.telegram.org) and login with your phone number.
2. Click under `API Development tools`.
3. A `Create new application` window will appear. Fill in your application details.
   There is no need to enter any `URL`, and only the first two fields (`App title` and `Short name`)
   can be changed later as long as I'm aware.
4. Click on `Create application` at the end. Now that you have the `API ID` and `Hash`

## Running

Download built package and execute with `--help` parameter, it will show a help text:

```shell
Usage: telegram-crypto-scraper [options]

Options:
  -V, --version                 output the version number
  --id <telegram_id>            api ID to connect to telegram
  --hash <telegram_hash>        api HASH to connect to telegram
  --phone <telegram_phone>      phone associated to this telegram account
  -d, --dot                     use dot as decimal separator
  -c, --cornix                  parse messages from cornix notification bot
  -p, --parse <channels>        parse cornix messages from channels (list of channels with comma separated)
  --help                        display help for command
```

### Extract cornix notification messages

To extract cornix notification messages you need to execute:

```shell
./telegram-crypto-scraper --id xxx --hash xxx --phone xxx -c
```

And the script will connect to your telegram (if it is the first time and you don't have the "session" file in "session" folder, you will need to introduce the code from telegram, to authorize the connection),
then the script will parse all messages from cornix notifications bot and will generate a .csv file into "csv" directory (it can take some seconds because of telegram flood protection)

### Extract cornix messages

To extract cornix messages from a channel you need to know the channel id and use it in parameters

```shell
./telegram-crypto-scraper --id xxx --hash xxx --phone xxx -p -100xxx
```

Multiple channels are allowed

```shell
./telegram-crypto-scraper --id xxx --hash xxx --phone xxx -p -100xxx,-100yyy,-100zzz
```

Generated csv will be placed in "csv" folder
