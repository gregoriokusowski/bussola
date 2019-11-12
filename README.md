# bussola
Find yourself in the middle of all the services you have.
Bússola means compass in Portuguese.

## Usage

Define your architecture in a yaml file, like the following:

```yaml
units:
  - name: avatar_service
    type: service
    metadata:
      context: profile
      location: kubernetes_cluster
      team: user_profile_team
    dependsOn:
    - avatar_database
```

## From the command line

### Compile

```bash
go build cmd/main.go
```

### Run

Get your graphviz result:

```bash
cat your_data.yaml | ./main -directives a,b,c > graph.dot
```

And convert your .dot file into png/svg/etc.

### Poor man's graphviz

```bash
cat your_data.yaml | ./main -directives a,b,c | pbcopy
```

and throw your results to http://www.webgraphviz.com/ or something similar


### Options

#### Directives

In order to nest your units inside different contexts, you can use the `-directives` option with `d1,d2,d3` syntax.

#### Filtering

You can filter your data by using the `-filter` cli option. The syntax is `k1:v1,v2;k2:v3` and will query your metadata.

## Api

### Compile

```bash
go build api/main.go
```

### Run

This will spin a up a server based on your data, available on the 9999 port.
```bash
./main your_data.yaml
```

### Get available params

```bash
curl localhost:9999/params
```

### Render dot file based on params [if any]

```bash
curl -XPOST -d '{"Filters":{"location":["aws_rds"]}}' localhost:9999/render
```
