import YAML from 'yamljs';
import Bussola from './Bussola';
import dummyData from './dummyData';

test('expect directives to be present', () => {
  const parsedYAML = YAML.parse(dummyData);
  const b = new Bussola(parsedYAML);
  expect(b.availableDirectives().length).toBe(4);
});
