package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"encoding/json"
	"github.com/gregoriokusowski/bussola"
	"gopkg.in/yaml.v2"
)

func main() {
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

	renderDot := func(w http.ResponseWriter, req *http.Request) {
		d := json.NewDecoder(req.Body)
		var p bussola.Params
		err := d.Decode(&p)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		w.Header().Set("Content-Type", "text/vnd.graphviz")
		io.WriteString(w, b.Print(&p))
	}

	provideParams := func(w http.ResponseWriter, req *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		j, err := json.Marshal(b.AvailableParams())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		w.Write(j)
	}

	http.Handle("/", http.FileServer(http.Dir("/static")))
	http.HandleFunc("/render", renderDot)
	http.HandleFunc("/params", provideParams)
	http.ListenAndServe(":9999", nil)
}
