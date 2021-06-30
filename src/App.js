import logo from './logo.svg';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      url: "https://",
      sensors: [],
    };
  }

  connexion() {
    try {
      this.client = mqtt.connect(this.state.url); //RENVOIE À URL DE PROPS

      //On connecte
      this.client.on("connect", () => {
        this.client.subscribe("value/#", (err) => {
          console.error(err);
        });
      });
      
      //Quand on reçoit on fait une action
      this.client.on("message", (topic, message) => {
        const id = parseInt(topic.split("/")[1]);
        const sensors = [...this.state.sensors];
        const sensor = sensors.find((sensor) => sensor.id === id);
        const newSensor = JSON.parse(message);

        if (newSensor.type === "PERCENT") //si c'est en pourcentage on met bien la valeur
          newSensor.value = newSensor.value * 100;
        

        if (sensor !== undefined) {
          const oldValue = sensor.oldValue;
          oldValue.unshift(sensor.value);
          sensor.value = this.transformationValue(newSensor.value, 1);
        } else {
          sensors.push({
            id: id,
            name: newSensor.name,
            value: this.transformationValue(newSensor.value, 1),
            type: newSensor.type,
            oldValue: [],
          });
        }

        // On update l'état du capteur
        this.setState({ sensors: sensors });
      });
    } catch (error) {
      console.log(error);
    }
  }

   //Transformation sur les données pour que ce soit plus lisible 
  transformationValue(value, nbDigit) {
    const val = parseFloat(value);
    return isNaN(val) ? value : val.toFixed(nbDigit);
  }

  changementURL = (event) => {
    this.setState({ url: event.target.value });
  };

  changementCapteur = (id) => {
    document
      .querySelectorAll("#sensorsList li")
      .forEach((s) => s.classList.remove(App.selected));
    document.getElementById("s" + id).classList.add(App.selected);
    this.setState({ wantedSensorId: id });
  };

  //Evenement
  newURL = (event) => {
    event.preventDefault();
    this.connexion();
  };

  render() {
    let wantedSensor = this.state.sensors.find(
      (sensor) => sensor.id === this.state.wantedSensorId
    );

    if (wantedSensor === undefined) {
      wantedSensor = {
        id: -1,
        name: "",
      };
    }
    return (
      <BrowserRouter>
        <div class="wrapper">
          <div id={"connexion "} class="Url">
            <h1>Url du Broker</h1>
            <form id={"formConnection"} onSubmit={this.newURL}>
              <input
                type={"url"}
                value={this.state.url}
                onChange={this.changementURL}
              />
              <input type={"submit"} value={"connexion "}/>
            </form>
          </div>
          <div class="Liste">
            <ListeSensors
              sensors={this.state.sensors}
              onChange={this.changementCapteur}
            />
          </div>
          <div class="Entite">
            <Route path={"/" + wantedSensor.name}>
              <SensorEntity sensor={wantedSensor} />
            </Route>
          </div>
        </div>
      </BrowserRouter>
    );
  }

 

}
export default App;
