import React from "react";
import { Chart } from "chart.js";
import Select from "react-select";
import axios from "axios";
import "./App.css";

const BITCOIN_DATA_FETCH = "https://api.coindesk.com/v1/bpi/currentprice.json";
const END_POINT_API = "https://api.coindesk.com/v1/bpi/historical/close.json";

const styles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const labesStyle = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: "1",
  minWidth: 1,
  padding: "0.16666666666667em 0.5em",
  textAlign: "center",
};
function App() {
  const [allSelectionOptions, setAllSelectionsOptions] = React.useState([]);
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [data, setData] = React.useState([]);
  const labelGroup = (data) => (
    <div style={styles}>
      <span>{data.label}</span>
      <span style={labesStyle}>{data.options.length}</span>
    </div>
  );
  React.useEffect(() => {
    axios
      .get(BITCOIN_DATA_FETCH)
      .then((res) => {
        const options = Object.entries(res.data.bpi).map(([key, value]) => ({
          value: { ...value },
          label: value.description,
        }));

        setAllSelectionsOptions(options);
        setSelectedOption(options[0]);
      })
      .catch((error) => {
        console.log(error.response);
      });
  }, []);

  React.useEffect(() => {
    if (selectedOption?.value?.code) {
      const formatter = (date) =>
        date.toLocaleDateString().split("/").reverse().join("-");
      const currentDate = formatter(new Date());
      const sixtyDaysBeforeDate = formatter(
        new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 60)
      );
      console.log("currentDate : ", currentDate);
      console.log("sixtyDaysBeforeDate : ", sixtyDaysBeforeDate);
      const API_END_POINT = `${END_POINT_API}?currency=${selectedOption?.value?.code}&start=${sixtyDaysBeforeDate}&end=${currentDate}`;
      axios
        .get(API_END_POINT)
        .then((res) => {
          console.log("res : ", res);
          const labels = [];
          const arr = Object.entries(res.data.bpi).map(([key, value], i) => {
            const date = new Date(key);
            labels.push(
              date.getDate() +
                " " +
                [
                  "JAN",
                  "FEB",
                  "MAR",
                  "APR",
                  "MAY",
                  "JUN",
                  "JUL",
                  "AUG",
                  "SEP",
                  "OCT",
                  "NOV",
                  "DEC",
                ][date.getMonth()]
            );
            return value;
          });
          var ctx = document.getElementById("myChart").getContext("2d");
          var gradientFill = ctx.createLinearGradient(0, 200, 0, 10);
          gradientFill.addColorStop(1, "rgba(145,255,163,1)");
          gradientFill.addColorStop(0, "rgba(255,255,255,1)");

          new Chart(ctx, {
            type: "line",
            data: {
              labels,
              datasets: [
                {
                  fill: true,
                  backgroundColor: gradientFill,
                  borderColor: "#8cefa6",
                  data: arr,
                  label: "Data",
                },
              ],
            },
            options: {
              title: {
                display: true,
                text: "Last 60 Days trend",
              },
              legend: {
                display: false,
              },
              scales: {
                yAxes: [
                  {
                    ticks: {
                      maxTicksLimit: 4,
                    },
                  },
                ],
                xAxes: [
                  {
                    gridLines: {
                      display: false,
                    },
                    ticks: {
                      maxTicksLimit: 2,
                    },
                  },
                ],
              },
            },
          });
          setData(arr);
        })
        .catch(console.error);
    }
  }, [selectedOption]);
  console.log("data : ", data);
  return (
    <div className="App">
      <div style={{ flex: 1, width: "100%", padding: 20 }}>
        {selectedOption && (
          <div style={{ width: "60%", paddingTop: 20 }}>
            <br />
            <p style={{ color: "gray" }}>1 Bitcoin Equals</p>

            <Select
              width="50%"
              defaultValue={selectedOption}
              options={allSelectionOptions}
              labelGroup={labelGroup}
              onChange={setSelectedOption}
            />
          </div>
        )}
        <p style={{ fontSize: "3vw" }}>
          {selectedOption?.value?.rate} {selectedOption?.value?.description}
        </p>
      </div>
      <div style={{ flex: 1, width: "100%", padding: 20 }}>
        <canvas id="myChart" width="100%" height="40%"></canvas>
      </div>
    </div>
  );
}

export default App;
