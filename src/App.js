import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core';
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph'
import "leaflet/dist/leaflet.css";

const App = () => {

  const [country, setCountry] = useState("worldwide"); 
  const [countries, setCountries] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  
  
  // STATE = How to write a variable in REACT
  // https://disease.sh/v3/covid-19/countries
  // USEEFFECT = Runs a piece of code 
  // based on a given condition

  useEffect(() => {
    fetch ("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then((data) => {
      setCountryInfo(data);
    });
  }, [])
 
  useEffect(() => {
    // The code inside here will run once 
    // when the component loads and not again
    // async -> send a request, wait for it , do something with info

    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, // United States, Britain
            value: country.countryInfo.iso2 // US, UK
          }));

          let sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    const url = 
      countryCode === "worldwide" 
        ? "https://disease.sh/v3/covid-19/all" 
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then(response => response.json())
      .then((data) => {
        // console.log(data.countryInfo);
        setCountry(countryCode);
        // All of the data...
        // from the country response
        setCountryInfo(data);
        if(countryCode === 'worldwide') {
          setMapCenter([34.80746, -40.4796 ]);
        }else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        }
        setMapZoom(4);
    });
  };

  return (
    // BEM Naming Convention 
    <div className="app">
      <div className="app__left">
        {/* Header */}
        <div className="app__header">
          {/* Title */}
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select varient="outlined" onChange={onCountryChange} value={country}>
              {/*  Loop through all the countries  
              and show a dropdown list of the options */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => ( 
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed 
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"  
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox 
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)} 
          />
          <InfoBox 
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        {/* Map 3:18*/}
        <Map  
        casesType={casesType}
        countries= {mapCountries}
        center={mapCenter}
        zoom={mapZoom}/>   
      </div>
      
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType= {casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
