# Giticket

Giticket : yet another ticketing / board / issues stuff ... but this time we push all information we need in git repository.  
This let us take advantage of git :

- Tickets are automatically versioned, forked, branched,
- Tickets automatically follow you code, and actually use your code to discover new tickets, or tickets to close, etc.
- `--everything-is-local`, meaning everybody can work on tickets in parallel in its own copy, then choose when to push stuff to the team.

> Disclaimer: Giticket is still an experimentation for now ; things are very likely to change until we release v1.0.0

## How it works

Giticket actualy uses one of the most powerful features of git : [Git objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects).
As the doc says : `It means that at the core of Git is a simple key-value data store`.

This atually means we can store any kind of data, including tickets in the very same repository than your code, but without poluting the later (by creating dedicated [refs](https://git-scm.com/book/en/v2/Git-Internals-The-Refspec)).  
Then, we're able to reference any code (branch, commit, file, ...) to our [trees](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects).

Futhermore, Git has excellent [https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks](hooks) system, so that we can track every change & actions made by git (including commands and GUI softwares), and augment git's behavior, just like a plugging would do.

## Installation

> Todo : we plan to provide a simple way to init Giticket in a repository

## comand line interface (cli)

Giticket comes with a simple cli in order to use tickets.
As Giticket relies on [commanderjs](https://github.com/tj/commander.js#readme), we can use `-h` switch to display usage command.

### item list

```
Usage: item list [options]

Options:
  -C, --path <path>  repository path ; current directory if ommited (default: "./")
  -s --size <size>   Size of the pagination
  -h, --help         display help for command
```

### item add

```
Usage: main item add [options] <title>

Arguments:
  title                            title of the new item

Options:
  -C, --path <path>                repository path ; current directory if ommited (default: "./")
  -d, --description <description>  description of the new item ; empty if ommited (default: "")
  -k, --kind <kind>                kind of the new item ; `issue` if ommited (default: "issue")
  -h, --help                       display help for command
```

### item edit

```
Usage: main item edit [options] <id>

Arguments:
  id                               item identifier

Options:
  -C, --path <path>                repository path ; current directory if ommited (default: "./")
  -t, --title <title>              item's title
  -d, --description <description>  item's description
  -k, --kind <kind>                item's kind
  -h, --help                       display help for command
```
