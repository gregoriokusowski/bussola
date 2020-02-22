const dummyData = `
units:
  - name: checkout_app
    metadata:
      type: service
      context: booking
      location: kubernetes
      team: team_a
    dependsOn:
    - checkout_db
  - name: checkout_db
    metadata:
      type: database
      context: booking
      location: rds
      team: team_a
`;

export default dummyData;
