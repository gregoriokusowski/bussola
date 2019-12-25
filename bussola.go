package bussola

import (
	"bytes"
	"fmt"
	"strings"
)

type Params struct {
	Directives         []string
	Filters            map[string][]string
	InclusiveFiltering bool
}

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

func (b *Bussola) Print(params *Params) string {
	var buffer bytes.Buffer
	buffer.WriteString("digraph G {\n")
	units := resolveUnits(b, params)
	writeGraph(&buffer, units, params.Directives)
	connections := resolveConnections(units)
	buffer.WriteString(strings.Join(connections, ""))
	buffer.WriteString("}")
	return buffer.String()
}

func (b *Bussola) AvailableParams() Params {
	return Params{
		Filters:    b.availableFilters(),
		Directives: b.availableDirectives(),
	}
}

func (b *Bussola) availableFilters() map[string][]string {
	m := make(map[string][]string)
	for _, d := range b.availableDirectives() {
		dm := make(map[string]bool)
		for _, u := range b.Units {
			dm[u.Metadata[d]] = true
		}
		for dmv, _ := range dm {
			m[d] = append(m[d], dmv)
		}
	}
	return m
}

func (b *Bussola) availableDirectives() []string {
	m := make(map[string]bool)
	for _, u := range b.Units {
		for d, _ := range u.Metadata {
			m[d] = true
		}
	}
	var directives []string
	for d, _ := range m {
		directives = append(directives, d)
	}
	return directives
}

func resolveUnits(b *Bussola, params *Params) []*Unit {
	var units []*Unit
	if len(params.Filters) == 0 {
		units = b.Units
	} else {
		m := make(map[*Unit]bool)
		for _, u := range b.Units {
			if params.InclusiveFiltering {
				for fk, fv := range params.Filters {
					for _, v := range fv {
						if u.Metadata[fk] == v {
							m[u] = true
						}
					}
				}
			} else {
				valid := true
				for fk, fv := range params.Filters {
					validForFilter := false
					for _, v := range fv {
						if u.Metadata[fk] == v {
							validForFilter = true
						}
					}
					if !validForFilter {
						valid = false
					}
				}
				if valid {
					m[u] = valid
				}
			}
		}
		for u, _ := range m {
			units = append(units, u)
		}
	}
	return units
}

func resolveConnections(units []*Unit) []string {
	m := make(map[string]bool)
	for _, u := range units {
		m[u.Name] = true
	}
	var connections []string
	for _, unit := range units {
		for _, dep := range unit.DependsOn {
			if m[dep] {
				connections = append(connections, fmt.Sprintf("%s -> %s;", dep, unit.Name))
			}
		}
	}
	return connections
}

func writeGraph(buffer *bytes.Buffer, units []*Unit, directives []string) {
	if len(directives) == 0 {
		for _, unit := range units {
			buffer.WriteString(fmt.Sprintf("%s [label=\"%s\"]; \n", unit.Name, unit.Name))
		}
	} else {
		currentDirective, remainingDirectives := directives[len(directives)-1], directives[:len(directives)-1]
		for groupName, groupUnits := range groupBy(units, currentDirective) {
			if groupName == "" {
				writeGraph(buffer, groupUnits, remainingDirectives)
			} else {
				buffer.WriteString(fmt.Sprintf("subgraph cluster_%s_%s {\n", currentDirective, groupName))
				buffer.WriteString(fmt.Sprintf("href = \"#%s___%s\";\n", currentDirective, groupName))
				buffer.WriteString(fmt.Sprintf("label = \"%s\";\n", groupName))
				writeGraph(buffer, groupUnits, remainingDirectives)
				buffer.WriteString("}\n")
			}
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
