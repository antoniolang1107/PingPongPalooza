import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

// this is still broken

export type DropdownSchema = {
    label: string,
    value: number,
}

interface PlayerNamesDropdownProps {
    namesData: Array<DropdownSchema>
}

const DropdownComponent: React.FC<PlayerNamesDropdownProps> = ({namesData}) => {
    const [value, setValue] = useState(null);
    // // const data = namesData;
    const [data] = React.useState(namesData);
    console.log("component: ", namesData);
    // const data = [{"label": "Name1", "value": 22}]
    if (data === undefined || data.length === 0) {
        return <>Loading...</>
      }

    return (
        <select>
            {data.map((player => <option value={player.value}>{player.label}</option>))}
        </select>
    );
//   return (
//     <Dropdown
//       style={styles.dropdown}
//       placeholderStyle={styles.placeholderStyle}
//       selectedTextStyle={styles.selectedTextStyle}
//       inputSearchStyle={styles.inputSearchStyle}
//       iconStyle={styles.iconStyle}
//       data={data}
//       search
//       maxHeight={300}
//       labelField="label"
//       valueField="value"
//       placeholder="Select item"
//       searchPlaceholder="Search..."
//       value={value}
//       onChange={item => {
//         console.log(item);
//         // setValue(item.value);
//       }}
//     />
//   );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});