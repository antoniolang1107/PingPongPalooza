import { StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';

export default function Register() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Tab</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
  }).then(response => response.text())
  .then(data => { console.log(data) });
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
