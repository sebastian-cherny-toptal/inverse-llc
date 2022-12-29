'use strict';
const e = React.createElement;


function App() {

  const [loggedInUsername, setLoggedInUsername] = React.useState(null);
  const [pageLanguage, setPageLanguage] = React.useState("en");
  const [collectionData, setCollectionData] = React.useState(null);
  const [userInfo, setUserInfo] = React.useState(null);
  const [graphType, setGraphType] = React.useState('bar');
  const [selectedTab, setSelectedTab] = React.useState('home');
  // 'home', 'environment', 'governance', 'social', 'diversity'

  const spreadsheetId = getSpreadsheetId();

  const getData = () => {
    getLoggedInUsername((username) => { setLoggedInUsername(username) });
    getPageLanguage((lang => { setPageLanguage(lang); }));
    get_spreadsheet_dashboard_api(spreadsheetId, (data) => setCollectionData(data.data));
    get_user_data_api((data) => setUserInfo(data.data))
  };

  const sendQuestion = () => {
    const text = document.querySelector("#question_textarea").value;
    if (!text) {
      alert("Message cannot be empty");
      return;
    }
    document.querySelector("#ask_question_btn").setAttribute("disabled", "true");
    ask_question_api(text, collectionData.id, () => {
      Swal.fire({
        title: 'Message sent!',
        text: "The admin will read your message and answer via email",
        icon: 'success',
        confirmButtonColor: "#434575",
      });
      document.querySelector("#question_textarea").value = "";
      document.querySelector("#ask_question_btn").removeAttribute("disabled");
    },
      () => {
        Swal.fire({
          title: 'There was an error',
          text: "Try again",
          icon: 'error',
          timer: 2000,
        });
        document.querySelector("#ask_question_btn").removeAttribute("disabled");
      },
    );
  };

  const constructVerticalBarGraph = (name, currentCollectionData) => {
    if (document.getElementById(name) && currentCollectionData != null) {
      if (window.barGraphs == undefined) {
        window.barGraphs = {};
      }
      if (window.barGraphs[name] != undefined) {
        window.barGraphs[name].destroy();
      }
      window.barGraphs[name] = new Chart(name, {
        type: "bar",
        data: {
          labels: currentCollectionData[name]['x_values'],
          datasets: [
            {
              backgroundColor: currentCollectionData[name]['background_color'] || '#BA68C8',
              data: currentCollectionData[name]['y_values'],
              label: 'Total = ' + currentCollectionData[name]['total_y_sum'],
            },
          ]
        },
        options: {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                beginAtZero: true,
              }
            }],
          },
          legend: { display: true },
          title: {
            display: true,
            text: currentCollectionData[name]['title']
          }
        }
      });
    }
  }

  if (collectionData != null) {
    constructVerticalBarGraph('bar_graph_industry_total_usds', collectionData[selectedTab]);
  }


  const constructDonutGraph = (name, currentCollectionData) => {
    if (document.getElementById(name) && currentCollectionData != null) {
      if (window.donutGraphs == undefined) {
        window.donutGraphs = {};
      }
      if (window.donutGraphs[name] != undefined) {
        window.donutGraphs[name].destroy();
      }
      const data = {
        labels: currentCollectionData[name]['x_values'],
        datasets: [{
          data: currentCollectionData[name]['y_values'],
          backgroundColor: currentCollectionData[name]['colors'],
          hoverOffset: 4
        }]
      };

      window.donutGraphs[name] = new Chart(name, {
        type: 'doughnut',
        data: data,
      });
    }
  }

  if (collectionData != null) {
    constructDonutGraph('donut_graph_category', collectionData[selectedTab]);
  }

  const ask_for_graph_and_load = () => {
    var data = {};
    if (graphType == 'bar') {
      const barXfield = document.getElementById('select_barXfield').value;
      const barYfield = document.getElementById('select_barYfield').value;
      data = { graphType, barXfield, barYfield };
    } else {
      const donutCategory = document.getElementById('select_donutCategory').value;
      const donutValue = document.getElementById('select_donutValue').value;
      data = { graphType, donutCategory, donutValue };
    }
    do_get_custom_graph_api(spreadsheetId, data, (graphDict) => {
      let newCollectionData = collectionData;
      newCollectionData['custom_graph'] = graphDict.data;
      setCollectionData(newCollectionData);
      if (graphType == 'bar') {
        if (window.donutGraphs['custom_graph'] != undefined) {
          window.donutGraphs['custom_graph'].destroy();
        }
        constructVerticalBarGraph('custom_graph', newCollectionData);
      } else {
        if (window.barGraphs['custom_graph'] != undefined) {
          window.barGraphs['custom_graph'].destroy();
        }
        constructDonutGraph('custom_graph', newCollectionData);
      }
      document.getElementById('custom_graph').style.display = 'block';
    })
  }

  const changeBroadCategory = () => {
    const data = { 'top_categories': collectionData['top10categories'][selectedTab] };
    constructVerticalBarGraph('top_categories', data);
  }

  const clickOnTabButton = (tabName) => {
    setSelectedTab(tabName);
  }
  const container = document.getElementById('regions_div');
  if (collectionData != null && container != null && container != undefined) {
    changeBroadCategory();
    google.charts.load('current', {
      'packages': ['geochart'],
    });
    google.charts.setOnLoadCallback(drawRegionsMap);

    function drawRegionsMap() {
      let dataArray = [['State', 'Popularity']];
      for (var i = 0; i < collectionData[selectedTab]['heat_map']['states'].length; i++) {
        const state = collectionData[selectedTab]['heat_map']['states'][i];
        const value = collectionData[selectedTab]['heat_map']['values'][i];
        dataArray.push(['US-' + state, value]);
      }
      console.log(dataArray)
      var data = google.visualization.arrayToDataTable(dataArray);

      var options = {
        'region': 'US',
        'colors': collectionData[selectedTab]['heat_map']['scale_colors'],
        'dataMode': 'markers',
        'resolution': 'provinces'
      };

      var chart = new google.visualization.GeoChart(container);

      chart.draw(data, options);
    }
  }

  React.useEffect(() => {
    getData();
  }, []);

  getLoggedInUsername((username) => { setLoggedInUsername(username) });

  return (
    <div>
      <AppHeader />
      <UserHeader loggedInUsername={loggedInUsername} setLoggedInUsername={setLoggedInUsername} redirectWhenLoggedOut={true}
        is_admin={userInfo && userInfo.is_admin} pageLanguage={pageLanguage} setPageLanguage={(lang) => { setLocalStorageLanguage(lang); setPageLanguage(lang); }}
      />
      <CollectionHeader
        collectionData={collectionData}
      />
      <div style={{
        maxWidth: "800px", margin: "auto", marginTop: "1em", marginBottom: "1em",
        padding: "1em", border: "1px solid", borderRadius: "1pxF"
      }}>
        {collectionData != null &&
          <div>
            <div style={{ display: "flex", marginRight: '5px' }}>
              <button type="button"
                className={"btn " + (selectedTab == 'home' ? 'tabSelected' : '')}
                id="homeBtn"
                style={{
                  marginRight: '20px',
                  color: '#4C22B3', borderColor: '#4C22B3', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('home') }}>CSR Overview</button>
              <button type="button"
                className={"btn " + (selectedTab == 'environment' ? 'tabSelected' : '')}
                id="environmentBtn"
                style={{
                  marginRight: '20px',
                  color: '#3D7345', borderColor: '#3D7345', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('environment') }}>Environment</button>
              <button type="button"
                className={"btn " + (selectedTab == 'governance' ? 'tabSelected' : '')}
                id="governanceBtn"
                style={{
                  marginRight: '20px',
                  color: '#0533FF', borderColor: '#0533FF', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('governance') }}>Governance</button>
              <button type="button"
                className={"btn " + (selectedTab == 'social' ? 'tabSelected' : '')}
                id="socialBtn"
                style={{
                  marginRight: '20px',
                  color: '#FFB43F', borderColor: '#FFB43F', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('social') }}>Social</button>
              <button type="button"
                className={"btn " + (selectedTab == 'diversity' ? 'tabSelected' : '')}
                id="diversityBtn"
                style={{
                  marginRight: '20px',
                  color: '#FF4114', borderColor: '#FF4114', border: '3px solid'
                }}
                onClick={() => { clickOnTabButton('diversity') }}>Diversity Metrics</button>
            </div>
            <div style={{ border: 'solid 1px' }}>
              <canvas id="bar_graph_industry_total_usds" style={{ width: "100%", maxWidth: "700px" }}></canvas>
              <br />
            </div>

            {collectionData != null && selectedTab === 'home' &&
              <div style={{ textAlign: "center", border: 'solid 1px', marginTop: '5px' }}>
                <label>{collectionData[selectedTab]['donut_graph_category']['title']}</label>
                <canvas id="donut_graph_category" style={{ width: "100%", maxWidth: "700px" }}></canvas>
                <br />
              </div>
            }
            {collectionData != null && selectedTab !== 'home' &&
              <div style={{ border: 'solid 1px', marginTop: '5px' }} >
                <label style={{ marginLeft: '5px' }}>Top categories per broad category</label>
                <canvas id="top_categories"
                  style={{
                    width: "100%", maxWidth: "700px",
                  }}></canvas>
                <br />
              </div>
            }
            {collectionData != null &&
              <div style={{ textAlign: "center", border: 'solid 1px', marginTop: '5px' }}>
                <label>Heat map for percentual CSR spending</label>
                <div id="regions_div" style={{ width: '900px', height: '500px' }}></div>
              </div>
            }
            {collectionData != null &&
              <div style={{ border: 'solid 1px', marginTop: '5px' }} >
                <label style={{ marginLeft: '5px' }}>Type of graph:</label>
                <select style={{ marginLeft: '5px' }} value={graphType} onChange={(e) => setGraphType(e.target.value)}>
                  <option value="bar">Bar graph</option>
                  <option value="donut">Donut graph</option>
                </select>
                <br />
                {graphType == 'bar' &&
                  <div>
                    <label style={{ marginLeft: '5px' }}>X field for bar graph:</label>
                    <select style={{ marginLeft: '5px' }} id="select_barXfield">
                      {collectionData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                    <label style={{ marginLeft: '5px' }}>Y field for bar graph:</label>
                    <select style={{ marginLeft: '5px' }} id="select_barYfield">
                      {collectionData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                  </div>
                }
                {graphType == 'donut' &&
                  <div>
                    <label style={{ marginLeft: '5px' }}>Category for donut:</label>
                    <select style={{ marginLeft: '5px' }} id="select_donutCategory">
                      {collectionData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                    <label style={{ marginLeft: '5px' }}>Values to aggregate:</label>
                    <select style={{ marginLeft: '5px' }} id="select_donutValue">
                      {collectionData['all_fields'].map((field, idx) =>
                        <option key={idx} value={field}>{field}</option>
                      )}
                    </select>
                    <br />
                  </div>
                }
                <button style={{
                  backgroundColor: "#434575", borderColor: "#434575",
                  marginLeft: '5px'
                }}
                  className="btn btn-primary"
                  onClick={() => ask_for_graph_and_load()}>Get graph</button>
                <canvas id="custom_graph"
                  style={{
                    width: "100%", maxWidth: "700px",
                    display: 'none'
                  }}></canvas>
                <br />
              </div>
            }

            {userInfo && userInfo.is_admin === false &&
              <div style={{ textAlign: "center" }}>
                <label>Ask a question</label>
                <br />
                <textarea id="question_textarea" style={{ width: "50%", height: "100px" }}></textarea>
                <br />
                <button id="ask_question_btn" style={{ backgroundColor: "#434575", borderColor: "#434575" }} className="btn btn-primary" onClick={() => { sendQuestion(); }}>Send question</button>
              </div>
            }
          </div>
        }
      </div>
    </div >
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);
