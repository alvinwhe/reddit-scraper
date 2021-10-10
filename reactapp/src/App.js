import React, { Component } from "react";
import MaterialTable from "material-table";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { expressData: [], loading: true };
    }

    callAPI() {
        fetch("http://localhost:9000/")
            .then(response => response.json())
            .then(res => this.setState({ expressData: res, loading: false }))
            .catch(error => error);
    }

    componentDidMount() {
        this.callAPI();
    }

    calculateTime(time) {
      if (time[1] === "minute" || time[1] === "minutes"){
        if (time[0] === "a"){
          return 1;
        } else {
          return parseInt(time[0]);
        }
      } else if (time[1] === "hour" || time[1] === "hours"){
        if (time[0] === "an"){
          return 60;
        } else {
          return parseInt(time[0])*60;
        }
      } else if (time[1] === "day" || time[1] === "days"){
        if (time[0] === "a"){
          return 60*24;
        } else {
          return parseInt(time[0])*60*24;
        }
      }
    }

    customSortTime(a, b) {
      //time will always be in format "x minute/hour/day(s) ago"
      var timeA = a.split(' ');
      var timeB = b.split(' ');

      timeA = this.calculateTime(timeA);
      timeB = this.calculateTime(timeB);
      return timeA-timeB
    }

    render() {
        return (
          <div>
            <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            />
            
            <MaterialTable
              columns={[
                { sorting: false, field: "thumbnail", render: rowData => <img src ={rowData.thumbnail} width='50px' height='50px'/>},
                { title: "Upvotes", field: "upvotes", type: 'numeric', align: 'left', defaultSort: 'desc' },
                { sorting: false, width: "30% !important",title: "Title", field: "url", render: rowData => <a href={rowData.url} target='_blank' max-width='70%'> {rowData.title} </a>},
                { width: "10% !important",title: "Last Updated", field: "time", type: 'numeric', customSort: (a,b) => this.customSortTime(a.time, b.time)},
              ]}
              data={this.state.expressData}
              title="Manga Tracker"
              options={{
                pageSize:20,       
                emptyRowsWhenPaging: false,
                pageSizeOptions:[20,40,60,80],
                tableLayout: "fixed",
              }}
              isLoading = {this.state.loading}
            />
          </div>
        );
    }
}

export default App;