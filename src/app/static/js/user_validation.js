'use strict';
const e = React.createElement;

function App() {
  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [state, setState] = React.useState("");
  const [city, setCity] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [message, setMessage] = React.useState("");

  const success = async (text) => {
    await localStorage.setItem("userToken", text.access);
    await localStorage.setItem("loggedInUsername", text.username);
    window.location = "/lyrics";
  };

  const checkIsEmpty = () => {
    if (!name) {
      setMessage("* Name is required");
      return true;
    }
    if (!lastName) {
      setMessage("* Last name is required");
      return true;
    }
    if (!address) {
      setMessage("* Address is required");
      return true;
    }
    if (!state) {
      setMessage("* State is required");
      return true;
    }
    return false;
  }

  const username = getUsername();

  const tryUserValidation = async (e) => {
    e.preventDefault();
    if (checkIsEmpty()) {
      return;
    }
    await validate_user_api({
      username, name, lastName,
      address, state, city, zipCode, company,
    }, success, (text) => { setMessage(text) });
  };

  if (localStorage.getItem("userToken") != null) {
    window.location = window.location.origin + "/profile";
  }

  return (
    <div >
      <AppHeader />
      <div style={{
        width: "400px", margin: "auto", marginTop: "200px",
        padding: "1em"
      }}>

        <form>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="name" className="form-control" id="name" placeholder="Name"
              onChange={(e) => { setName(e.target.value) }} value={name}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="last_name" className="form-label">Last Name</label>
            <input type="last_name" className="form-control" id="last_name" placeholder="Last name"
              onChange={(e) => { setLastName(e.target.value) }} value={lastName}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label">Address</label>
            <input type="text" className="form-control" id="address" placeholder="Address"
              onChange={(e) => { setAddress(e.target.value) }} value={address}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="state" className="form-label">State</label>
            <input type="text" className="form-control" id="state" placeholder="State"
              onChange={(e) => { setState(e.target.value) }} value={state}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="city" className="form-label">City</label>
            <input type="text" className="form-control" id="city" placeholder="City"
              onChange={(e) => { setCity(e.target.value) }} value={city}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="zip_code" className="form-label">Zip code</label>
            <input type="text" className="form-control" id="zip_code" placeholder="Zip"
              onChange={(e) => { setZipCode(e.target.value) }} value={zipCode}
              style={{ width: "60%" }} />
          </div>
          <div className="mb-3">
            <label htmlFor="company" className="form-label">Company</label>
            <input type="text" className="form-control" id="company" placeholder="Company"
              onChange={(e) => { setCompany(e.target.value) }} value={company}
              style={{ width: "60%" }} />
          </div>
          <div style={{ margin: "1em", color: "#ffffff" }}>{message}</div>
          <div style={{ margin: "1em" }}>
            <button type="submit" style={{
              marginLeft: "inherit", marginTop: "inherit",
              backgroundColor: "#434575", borderColor: "#434575"
            }} className="btn btn-primary" onClick={tryUserValidation}>Validate</button>
          </div>
          <div style={{ margin: "1em" }}>
            <label style={{ marginTop: "inherit" }}>
              Already have a user? <a id="login_btn" href="/login">Login</a>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}

const domContainer = document.querySelector('#reactAppContainer');
ReactDOM.render(
  e(App),
  domContainer
);

