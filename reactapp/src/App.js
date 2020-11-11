import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { expressRes: [], loading: true };
    }

    callAPI() {
        fetch("http://localhost:9000/")
            .then(response => response.json())
            .then(res => this.setState({ expressRes: res, loading: false }))
            .catch(error => error);
        
    }

    componentDidMount() {
        this.callAPI();
    }

    render() {
        console.log(this.state.expressRes);
        return (
            <table>
              <tbody>
                {this.state.expressRes.map(x => 
                <tr key={x.title}>
                  <td> <img src ={x.thumbnail} width='50px' height='50px'/> </td> 
                  <td> {x.upvotes} </td> 
                  <td> <a href={x.url} target='_blank' max-width='70%'> {x.title} </a> </td>
                  <td> {x.time} </td>
                </tr>)}
              </tbody>
            </table>
        );
    }
}

export default App;