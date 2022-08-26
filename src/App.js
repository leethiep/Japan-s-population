import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import apiKey from './apiKey';

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this._changeSelection = this._changeSelection.bind(this);
  }

  componentDidMount() {
    
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': apiKey }
    })
      .then(response => response.json())
      .then(res => {

        this.setState({ prefectures: res.result });
      });
  }

  _changeSelection(index) {
    const selected_copy = this.state.selected.slice();

    // selected
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      fetch(
        ` https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index +
        1}`,
        {
          headers: { 'X-API-KEY': apiKey }
        }
      )
        .then(response => response.json())
        .then(res => {

          let value = [];
          Object.keys(res.result.data[0].data).forEach(i => {
            console.log(res.result.data[0].data[i].value)

            value.push(res.result.data[0].data[i].value);


          });
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: value

          };

          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      // チェック済みの場合はseriesから削除
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderItem(props) {
    return (
      <div
        key={props.prefCode}
        style={{ margin: '10px', display: 'inline-block' }}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this._changeSelection(props.prefCode - 1)}
          style={{ cursor: 'pointer' }}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: ' '
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointInterval: 5,
          pointStart: 1965,

        }
      },
      series: this.state.series
    };
    return (
      <div>
        <div className="header">
          <h1>人口増減</h1>
          {/* <h1>Japan's Population Change </h1> */}
          <input className='search' type="search" placeholder="Search..." />


        </div>
        <div className="container">
          <div className="checklist">
            <h2>Choose the city / 都市を選ぶ</h2>
            
            {Object.keys(obj).map(i => this.renderItem(obj[i]))}

          </div>
          <div className="chart">

            <HighchartsReact highcharts={Highcharts} options={options} />
          </div>
        </div>


      </div>
    );
  }
}

export default App;