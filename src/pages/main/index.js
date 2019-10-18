import React from 'react';

import { View, Text } from 'react-native';
import fb from 'react-native-firebase';
import { Dimensions } from 'react-native';
import { StatusBar, Modal } from 'react-native'; // Adicionado o Modal
import { RNCamera } from 'react-native-camera';

import {
  Container,
  AnnotationContainer,
  AnnotationText,
  NewButtonContainer,
  ButtonsWrapper,
  CancelButtonContainer,
  SelectButtonContainer,
  ButtonText,
  Marker,
  ModalContainer,
  ModalImagesListContainer,
  ModalImagesList,
  ModalImageItem,
  ModalButtons,
  CameraButtonContainer,
  CancelButtonText,
  ContinueButtonText,
  TakePictureButtonContainer,
  TakePictureButtonLabel,
} from './styles';

export default class Main extends React.Component {

  static navigationOptions = {
    header: null,
  };

  state = {
    locations: [],
    newRealty: false,
    cameraModalOpened: false,
    dataModalOpened: false,
    realtyData: {
      location: {
        latitude: null,
        longitude: null,
      },
      name: '',
      price: '',
      address: '',
      images: [],
    },
};

  async componentDidMount() {
    const imoveis = [];
    console.log('imoveis: ')
    fb.firestore()
    .collection('imoveis')
    .onSnapshot((querySnapshot) => {
      console.log('x')
      querySnapshot.forEach(doc => {
        console.log('r'+ doc.data())
        const { address } = doc.data();
        imoveis.push({
          id: doc.id,
          address
        })
      })
      console.log(imoveis)
    })
  }

  renderCameraModal = () => (
    <Modal
      visible={this.state.cameraModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleCameraModalClose}
    >
      <ModalContainer>
        <ModalContainer>
          <RNCamera
            ref={camera => {
              this.camera = camera;
            }}
            style={{ flex: 1 }}
            type={RNCamera.Constants.Type.back}
            autoFocus={RNCamera.Constants.AutoFocus.on}
            flashMode={RNCamera.Constants.FlashMode.off}
            permissionDialogTitle={"Permission to use camera"}
            permissionDialogMessage={
              "We need your permission to use your camera phone"
            }
          />
          <TakePictureButtonContainer onPress={this.handleTakePicture}>
            <TakePictureButtonLabel />
          </TakePictureButtonContainer>
        </ModalContainer>
        { this.renderImagesList() }
        <ModalButtons>
          <CameraButtonContainer onPress={this.handleCameraModalClose}>
            <CancelButtonText>Cancelar</CancelButtonText>
          </CameraButtonContainer>
          <CameraButtonContainer onPress={this.handleDataModalClose}>
            <ContinueButtonText>Continuar</ContinueButtonText>
          </CameraButtonContainer>
        </ModalButtons>
      </ModalContainer>
    </Modal>
  )

  handleTakePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true, forceUpOrientation: true, fixOrientation: true, };
      const data = await this.camera.takePictureAsync(options)
      const { realtyData } = this.state;
      this.setState({ realtyData: {
        ...realtyData,
        images: [
          ...realtyData.images,
          data,
        ]
      }})
    }
  }
  
  renderImagesList = () => (
    this.state.realtyData.images.length !== 0 ? (
      <ModalImagesListContainer>
        <ModalImagesList horizontal>
          { this.state.realtyData.images.map(image => (
            <ModalImageItem source={{ uri: image.uri }} resizeMode="stretch" />
          ))}
        </ModalImagesList>
      </ModalImagesListContainer>
    ) : null
  )
  
  handleCameraModalClose = () => this.setState({ cameraModalOpened: !this.state.cameraModalOpened })
  
  handleDataModalClose = () => this.setState({
    dataModalOpened: !this.state.dataModalOpened,
    cameraModalOpened: false,
  })

  handleNewRealtyPress = () => 
    this.setState({ newRealty: !this.state.newRealty })

  handleGetPositionPress = async () => {
    try {
      const [longitude, latitude] = [1,2];
      this.setState({
        cameraModalOpened: true,
        realtyData: {
          ...this.state.realtyData,
          location: {
            latitude,
            longitude,
          },
        },
      });
    } catch (err) {
      console.tron.log(err);
    }
  }

  renderConditionalsButtons = () => (
    !this.state.newRealty ? (
      <NewButtonContainer onPress={this.handleNewRealtyPress}>
        <ButtonText>Novo Imóvel</ButtonText>
      </NewButtonContainer>
    ) : (
      <ButtonsWrapper>
        <SelectButtonContainer onPress={this.handleGetPositionPress}>
          <ButtonText>Selecionar localização</ButtonText>
        </SelectButtonContainer>
        <CancelButtonContainer onPress={this.handleNewRealtyPress}>
          <ButtonText>Cancelar</ButtonText>
        </CancelButtonContainer>
      </ButtonsWrapper>
    )
  )

  renderDataModal = () => (
    <Modal
      visible={this.state.dataModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleDataModalClose}
    >
      <ModalContainer>
        { this.renderImagesList() }
        <Form>
          <Input
            placeholder="Nome do Imóvel"
            value={this.state.realtyData.name}
            onChangeText={name => this.handleInputChange('name', name)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            placeholder="Endereço"
            value={this.state.realtyData.address}
            onChangeText={address => this.handleInputChange('address', address)}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Input
            placeholder="Preço"
            value={this.state.realtyData.price}
            onChangeText={price => this.handleInputChange('price', price)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Form>
        <DataButtonsWrapper>
          <SelectButtonContainer onPress={this.saveRealty}>
            <ButtonText>Salvar Imóvel</ButtonText>
          </SelectButtonContainer>
          <CancelButtonContainer onPress={this.handleDataModalClose}>
            <ButtonText>Cancelar</ButtonText>
          </CancelButtonContainer>
        </DataButtonsWrapper>
      </ModalContainer>
    </Modal>
  )

  render(){
    return (
      <View>
        <Text>IMOVEIS</Text>
      </View>
    )
  } 
}