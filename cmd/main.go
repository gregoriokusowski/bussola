package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"strings"

	"github.com/gregoriokusowski/bussola"
	"gopkg.in/yaml.v2"
)

func main() {
	raw_directives := flag.String("directives", "", "How the graph should nest info")
	raw_filters := flag.String("filters", "", "What information should be shown")

	flag.Parse()

	directives := strings.Split(*raw_directives, ",")
	filters := make(map[string][]string)
	if *raw_filters != "" {
		f := strings.Split(*raw_filters, ";")
		for _, fo := range f {
			s := strings.Split(fo, ":")
			o, v := s[0], s[1]
			filters[o] = strings.Split(v, ",")
		}
	}

	params := &bussola.Params{
		Directives: directives,
		Filters:    filters,
	}

	var data []byte
	var err error
	switch flag.NArg() {
	case 0:
		data, err = ioutil.ReadAll(os.Stdin)
		if err != nil {
			panic(err)
		}
		break
	case 1:
		data, err = ioutil.ReadFile(flag.Arg(0))
		if err != nil {
			panic(err)
		}
		break
	default:
		fmt.Printf("input must be from stdin or file\n")
		os.Exit(1)
	}

	b := bussola.Bussola{}
	err = yaml.Unmarshal(data, &b)
	if err != nil {
		log.Fatalf("error: %v", err)
	}
	fmt.Print(bussola.Print(&b, params))
}
