import React from 'react';
import { View, Text, AsyncStorage, Button, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';

import Login from './screens/Login'
class App extends React.Component {

  constructor() {
    super();
    this.unsubscriber = null;
    this.state = {
        user: null,
        errorMessage: null
    }
  }
  /**
   * Observa qualquer mudança que aconteca no estado da autenticacao e atualiza o estado do usuário
   */
  componentDidMount() {
    this.unsubscriber = firebase.auth().onAuthStateChanged((user) => {
        this.setState({ user });
    })
  }

  componentWillUnmount() {
    if(this.unsubscriber) {
        this.unsubscriber();
    }
  }

  signIn = async () => {
      try {
          
        const response = {
            data: {
                user: {
                    email: '',
                    password: ''
                },
                token: '',
                errorMessage: 'User not found'
            }
        }
        const { user, token } = response.data;
        
        throw response

        await AsyncStorage.multiSet([
            ['@CodeApi:token', token],
            ['@CodeApi:user', JSON.stringify(user)],
        ])
      } catch (response) {
          this.setState({ errorMessage: response.data.error })
          
      }
  }

  render() {
    console.log(this.state.user)
    if (!this.state.user) {
        return <Login />;
    }

    return (
      <View style={styles.container}>
          {this.state.errorMessage && <Text>{ this.state.errorMessage }</Text> }
        {/* <Text>Bem-vindo {this.state.user.email}!</Text> */}
        <Button onPress={this.signIn} title="Entrar"></Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default App;