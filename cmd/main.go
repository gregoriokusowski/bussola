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
	directives := flag.String("directives", "", "How the graph should nest info")

	flag.Parse()
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
	fmt.Print(bussola.Print(b.Units, strings.Split(*directives, ",")))
}
