# Bussola

Bussola is a tool to manage diagrams.
It was made with Software Infrastructure in mind, but can be used in other domains.

In order to use, you can just navitate to [it](https://gregoriokusowski.github.io/bussola/index.html) and edit your definition there.

A main bussola entity is defined by three top level keys: `filter`, `directives`, and `units`.

## Units

Units are the entities that represent your system. They are often something like a service, database, stream, or external provider. Nothing limits you to use it as a stakeholder, class, or method.

Units are defined with three things: `name`, `metadata`, and `dependencies` (this one referenced as `dependsOn`).

### Units - Name

The name of the unit should be unique as it will be used when defining dependencies with other units.
Currently the name should contain letters, numbers and underscores.

### Units - Metadata

Metadata is basically a key-value map that you can define for each unit. Bussola doesn't enforce any policy on how many key value pairs you can have, nor the keys that you should use.
This is the part that makes Bussola very flexible. You will soon learn how to use metadata to filter and group units.
Examples would be to specify the team that owns a service, like `team: a_team`, or where a database is located, like `location: aws_rds`.

### Units - Dependencies

By using the `dependsOn` array in your units, Bussola can then show which units depends on other units when displaying your diagram.
The array should only contain the unit names you want to refer to.

## Filters

Filters rely on your definition of metadata, and will only display the data that you want.
For example, if you want to show only units that belong to the `a_team`, you can specify `team: [a_team]`.
As yaml allows us to, you can also define it in multiple lines to support more values:

```yaml
filters:
  team:
    - a_team
    - b_team
# ...
```

You can add multiple filters, as you wish. Keep in mind they are exclusive.

## Directives

So, probably by now you can define a plethora of loose boxes that are connected (or not) with each other.
In order to make a better meaning of them, you can now use the metadata you defined for them to group and nest them by just defining like the following:

```
directives:
  - team
  - location
```


## Copyright and license

Bussola is released under the MIT License.
The used boilerplate is based on bulma-start from Jeremy Thomas. Code copyright 2017 Jeremy Thomas. Code released under [the MIT license](https://github.com/jgthms/bulma-start/blob/master/LICENSE).
