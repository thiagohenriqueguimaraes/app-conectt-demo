import React from 'react';
import { 
  View, 
  Text, 
  AsyncStorage, 
  Button, 
  StyleSheet,
  Alert
} from 'react-native';
import firebase from 'react-native-firebase';

import Login from './screens/Login'
import ProjectCard from './screens/ProjectCard'
class App extends React.Component {

  constructor() {
    super();
    this.unsubscriber = null;
    this.state = {
        user: null,
        loggerInUser: null,
        errorMessage: null,
        projects: []
    }
  }
  /**
   * Observa qualquer mudança que aconteca no estado da autenticacao e atualiza o estado do usuário
   */
  async componentDidMount() {
    await AsyncStorage.clear();

    const token = await AsyncStorage.getItem('@CodeApi:token');
    const user = JSON.parse(await AsyncStorage.getItem('@CodeApi:user')) || null;

    if (token && user) 
      this.setState({ loggedInUser: user });
  }

  signIn = async () => {
      try {
          
        const response = {
            data: {
                user: {
                    email: 'thiago@gmail.com',
                    password: '123456'
                },
                token: '',
                error: 'User not found'
            }
        }
        const { user, token } = response.data;
        
        // throw response

        await AsyncStorage.multiSet([
            ['@CodeApi:token', token],
            ['@CodeApi:user', JSON.stringify(user)],
        ])
 
        this.setState({loggerInUser: user})

        Alert.alert('Logado com sucesso!');
      } catch (response) {
          console.log(response)
          this.setState({ errorMessage: response.data.error })    
      }
  }

  getProjectList = async () => {
    try {
      const projects = [{_id:'A', description:'aaa'}, {_id:'B', description:'bbb'}, {_id:'C', description:'ccc'}];

      this.setState({projects});
    } catch (error) {
      this.setState({ errorMessage : err.data.error })
    }
  }
  render() {
    // console.log(this.state.user)
    // if (!this.state.user) {
    //     return <Login />;
    // }

    return (
      <View style={styles.container}>
        {this.state.errorMessage && <Text>{ this.state.errorMessage }</Text> }
        {/* <Text>Bem-vindo {this.state.user.email}!</Text> */}
        { this.state.loggerInUser
          ? <Button onPress={this.getProjectList} title="Carrregar projetos"/>
          : <Button onPress={this.signIn} title="Entrar" />
        }
        
        {this.state.projects.map(project => (
          // <Greeting greeting={{ text: project._id }} />
          <ProjectCard project={project} />
        ))}
      </View>
    );
  }
}

const Greeting = ({ greeting }) => <Text>{greeting.text}</Text>;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default App;