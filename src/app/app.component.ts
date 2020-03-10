import { Component } from '@angular/core';
import { ActiveCondition, Patient } from './types';
import { HttpClient } from '@angular/common/http';
import { Sort } from '@angular/material/sort';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'else-app';
  currentPatient: Patient;
  sortedData: ActiveCondition[];
  loadingPatient = true;
  loadingConditions = true;
  constructor(private http: HttpClient) {
    this.getPatientData(4342010).subscribe((res: { entry }) => {
      const patientResource = res.entry[0].resource;
      const unformattedName: string = patientResource.name.filter(name => name.use === 'official')[0].text;
      const patientName =
    `${this.upperCaseFirstLetter(unformattedName.split(',')[1].trim())} ${this.upperCaseFirstLetter(unformattedName.split(',')[0].trim())}`;
      const patientGender = patientResource.gender;
      const patientDOB = patientResource.birthDate;
      this.currentPatient = this.currentPatient ?
        { ...this.currentPatient, dateOfBirth: patientDOB, name: patientName, gender: patientGender } :
        { dateOfBirth: patientDOB, name: patientName, gender: patientGender };
      this.loadingPatient = false;
    });

    this.getConditionData(4342010).subscribe((res: { entry }) => {
      const activeEntries = res.entry.filter(condition => condition.resource.clinicalStatus === 'active').map(entry => entry.resource);
      const activeConditions = activeEntries.map(condition => {
        return {
          name: condition.code.text,
          dateRecorded: condition.dateRecorded,
          pubMedLink: `https://www.ncbi.nlm.nih.gov/pubmed/?term=${condition.code.text}`
        };
      });

      this.currentPatient = this.currentPatient ?
        { ...this.currentPatient, conditions: activeConditions } :
        { conditions: activeConditions };
      this.sortedData = activeConditions;
      this.loadingConditions = false;
    });
  }

  upperCaseFirstLetter(str: string) {
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
  }

  getPatientData(patientId: number) {
    return this.http.get(`https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Patient?_id=${patientId}`);

  }

  getConditionData(patientId: number) {
    return this.http.get(`https://fhir-open.sandboxcerner.com/dstu2/0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca/Condition?patient=${patientId}`);
  }

  sortData(sort: Sort) {
    const data = this.currentPatient.conditions.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'dateRecorded': return this.compare(new Date(a.dateRecorded), new Date(b.dateRecorded), isAsc);
        case 'pubMedLink': return this.compare(a.pubMedLink, b.pubMedLink, isAsc);

        default: return 0;
      }
    });
  }

  compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
