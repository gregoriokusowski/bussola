package bussola

import "testing"

func sampleBussola() *Bussola {
	return &Bussola{
		Units: []*Unit{
			&Unit{
				Metadata: map[string]string{
					"language":  "java",
					"framework": "spring",
				},
			},
			&Unit{
				Metadata: map[string]string{
					"language":  "kotlin",
					"framework": "spring",
				},
			},
		},
	}
}

func TestFiltering(t *testing.T) {
	units := resolveUnits(sampleBussola(), &Params{Filters: map[string][]string{"language": []string{"java"}}})
	if len(units) != 1 {
		t.Errorf("Expected only one unit, got %d", len(units))
	}

	units = resolveUnits(sampleBussola(), &Params{
		Filters: map[string][]string{
			"language":  []string{"java"},
			"framework": []string{"spring"},
		},
		InclusiveFiltering: true,
	})
	if len(units) != 2 {
		t.Errorf("Expected two units, got %d", len(units))
	}

	units = resolveUnits(sampleBussola(), &Params{
		Filters: map[string][]string{
			"language":  []string{"java"},
			"framework": []string{"spring"},
		},
	})
	if len(units) != 1 {
		t.Errorf("Expected only one unit, got %d", len(units))
	}
}
