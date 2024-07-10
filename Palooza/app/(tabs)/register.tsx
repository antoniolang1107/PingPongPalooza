import { StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';

// class Form extends React.Component {
//   constructor() {
//     super();
//     this.handleSubmit = this.handleSubmit.bind(this);
//   }

//   handleSubmit(event: any) {
//     event.preventDefault();
//     const data = new FormData(event.target);

//     console.log(data.get('email')); // Reference by form input's `name` tag

//     fetch('/api/form-submit-url', {
//       method: 'POST',
//       body: data,
//     });
//   }
// }

export default function Register() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Tab</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <button onClick={mytest}>hello</button>
      {/* <input id='firstName' placeholder='First Name'></input>
      <input id='lastName' placeholder='Last Name'></input> */}
      <input id='pseudonym' placeholder='Competitor Name'></input>
      {/* <input id='pin' placeholder='PIN'></input> */}
      <button onClick={submit}>Submit Details</button>
      {/* <Form></Form> */}
    </View>
  );
}

// handleFirstNameChange: function(e) {
//   this.setState({first_name: e.target.value});
// };

async function submit() {
  // const firstName = document.getElementById("firstName") as HTMLInputElement;
  // const lastName = document.getElementById("lastName") as HTMLInputElement;
  const pseudonym = document.getElementById("pseudonym") as HTMLInputElement;
  // const pin = document.getElementById("pin") as HTMLInputElement;
  // encrypt the pin here
  fetch('http://127.0.0.1:5000/new-player', {
    method: 'post',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      // "first_name": firstName.value,
      // "last_name": lastName.value,
      "competitor_name": pseudonym.value,
      // "pin": pin.value
    })
  });
}

async function mytest() {
  console.log("in ping")
  const myTemp = await api('http://127.0.0.1:5000/ping')
  console.log(myTemp)
}

async function api<T>(url: string): Promise<T> {
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return response.json() as Promise<T>
    })
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
