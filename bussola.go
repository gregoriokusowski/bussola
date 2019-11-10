package bussola

import (
	"bytes"
	"fmt"
	"strings"
)

type Bussola struct {
	Units []*Unit `yaml:"units"`
}

type Unit struct {
	Name      string   `yaml:"name"`
	Url       string   `yaml:"url"`
	Type      string   `yaml:"type"`
	Metadata  Metadata `yaml:"metadata"`
	DependsOn []string `yaml:"dependsOn"`
}

type Metadata map[string]string

func Print(units []*Unit, directives []string) string {
	var buffer bytes.Buffer
	buffer.WriteString("digraph G {\n")
	writeGraph(&buffer, units, directives, "")
	connections := resolveConnections(units)
	buffer.WriteString(strings.Join(connections, ""))
	buffer.WriteString("}")
	return buffer.String()
}

func resolveConnections(units []*Unit) []string {
	var connections []string
	for _, unit := range units {
		for _, dep := range unit.DependsOn {
			connections = append(connections, fmt.Sprintf("%s -> %s;", dep, unit.Name))
		}
	}
	return connections
}

func writeGraph(buffer *bytes.Buffer, units []*Unit, directives []string, clusterPrefix string) {
	if len(directives) == 0 {
		for _, unit := range units {
			buffer.WriteString(fmt.Sprintf("%s [label=\"%s\"]; \n", unit.Name, unit.Name))
		}
	} else {
		currentDirective, remainingDirectives := directives[len(directives)-1], directives[:len(directives)-1]
		for groupName, groupUnits := range groupBy(units, currentDirective) {
			buffer.WriteString(fmt.Sprintf("subgraph cluster_%s_%s {\n", clusterPrefix, groupName))
			buffer.WriteString(fmt.Sprintf("label = \"%s\";\n", groupName))
			writeGraph(buffer, groupUnits, remainingDirectives, clusterPrefix+"_"+groupName)
			buffer.WriteString("}\n")
		}
	}
}

func groupBy(units []*Unit, directive string) map[string][]*Unit {
	groups := make(map[string][]*Unit)

	for _, unit := range units {
		group := unit.Metadata[directive]
		groups[group] = append(groups[group], unit)
	}

	return groups
}
