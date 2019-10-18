import React from 'react';

import { View, Text } from 'react-native';
import fb from 'react-native-firebase';
import { StatusBar, Modal, AsyncStorage } from 'react-native'; // Adicionado o Modal
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
  DataButtonsWrapper,
  MarkerContainer,
  MarkerLabel,
  Form,
  Input,
  DetailsModalFirstDivision,
  DetailsModalSecondDivision,
  DetailsModalThirdDivision,
  DetailsModalBackButton,
  DetailsModalPrice,
  DetailsModalRealtyTitle,
  DetailsModalRealtySubTitle,
  DetailsModalRealtyAddress,
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

  componentDidMount() {
    this.getLocation();
  }

  getLocation = async () => {
    const ref = fb.firestore().collection('imoveis');
    try {
      const imoveis = [];
      ref.onSnapshot((querySnapshot) => {
        querySnapshot.forEach(doc => {
          const { address } = doc.data();
          imoveis.push({
            id: doc.id,
            address
          })
        })

        this.setState({ locations: imoveis[0].location });
      })
    } catch (err) {
      console.tron.log(err);
    }
  }

  handleNewRealtyPress = () => this.setState({ newRealty: !this.state.newRealty })

  handleCameraModalClose = () => this.setState({ cameraModalOpened: !this.state.cameraModalOpened })

  handleDataModalClose = () => this.setState({
    dataModalOpened: !this.state.dataModalOpened,
    cameraModalOpened: false,
  })

  handleDetailsModalClose = index => this.setState({
    detailsModalOpened: !this.state.detailsModalOpened,
    realtyDetailed: index,
  })

  handleGetPositionPress = async () => {
    try {
      // TODO: a locatizacao deveria ter pega do mapa ex: await this.map.getCenter()
      const [longitude, latitude] = [-27.210768, -49.644018];
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
        {this.renderImagesList()}
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
      this.setState({
        realtyData: {
          ...realtyData,
          images: [
            ...realtyData.images,
            data,
          ]
        }
      })
    }
  }

  handleTakePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true, forceUpOrientation: true, fixOrientation: true, };
      const data = await this.camera.takePictureAsync(options)
      const { realtyData } = this.state;
      this.setState({
        realtyData: {
          ...realtyData,
          images: [
            ...realtyData.images,
            data,
          ]
        }
      })
    }
  }

  handleInputChange = (index, value) => {
    const { realtyData } = this.state;
    switch (index) {
      case 'name':
        this.setState({
          realtyData: {
            ...realtyData,
            name: value,
          }
        });
        break;
      case 'address':
        this.setState({
          realtyData: {
            ...realtyData,
            address: value,
          }
        });
        break;
      case 'price':
        this.setState({
          realtyData: {
            ...realtyData,
            price: value,
          }
        });
        break;
    }
  }

  saveRealty = async () => {
    try {
      const {
        realtyData: {
          name,
          address,
          price,
          location: {
            latitude,
            longitude
          },
          images
        }
      } = this.state;

      const newRealtyResponse = await api.post('/properties', {
        title: name,
        address,
        price,
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
      });

      const imagesData = new FormData();

      images.forEach((image, index) => {
        imagesData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `${newRealtyResponse.data.title}_${index}.jpg`
        });
      });

      await api.post(
        `/properties/${newRealtyResponse.data.id}/images`,
        imagesData,
      );

      this.getLocation()
      this.handleDataModalClose()
      this.setState({ newRealty: false });
    } catch (err) {
      console.tron.log(err);
    }
  }

  renderConditionalsButtons = () => (
    !this.state.newRealty ?
      (
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
  renderImagesList = () => (
    this.state.realtyData.images.length !== 0 ? (
      <ModalImagesListContainer>
        <ModalImagesList horizontal>
          {this.state.realtyData.images.map(image => (
            <ModalImageItem source={{ uri: image.uri }} resizeMode="stretch" />
          ))}
        </ModalImagesList>
      </ModalImagesListContainer>
    ) : null
  )

  renderDetailsImagesList = () => (
    this.state.detailsModalOpened && (
      <ModalImagesList horizontal>
        { this.state.locations[this.state.realtyDetailed].images.map(image => (
          <ModalImageItem
            key={image.id}
            source={{ uri: `http://10.0.3.2:3333/images/${image.path}` }}
            resizeMode="stretch"
          />
        ))}
      </ModalImagesList>
    )
  )

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

  renderDataModal = () => (
    <Modal
      visible={this.state.dataModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleDataModalClose}
    >
      <ModalContainer>
        <ModalContainer>
        </ModalContainer>
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

  renderDetailsModal = () => (
    <Modal
      visible={this.state.detailsModalOpened}
      transparent={false}
      animationType="slide"
      onRequestClose={this.handleDetailsModalClose}
    >
      <ModalContainer>
        <DetailsModalFirstDivision>
          <DetailsModalBackButton onPress={() => this.handleDetailsModalClose(null)}>
            Voltar
          </DetailsModalBackButton>
        </DetailsModalFirstDivision>
        <DetailsModalSecondDivision>
          <DetailsModalRealtyTitle>
            {this.state.detailsModalOpened
              ? this.state.locations[this.state.realtyDetailed].title
              : ''
            }
          </DetailsModalRealtyTitle>
          <DetailsModalRealtySubTitle>Casa mobiliada com 3 quartos + quintal</DetailsModalRealtySubTitle>
          <DetailsModalRealtyAddress>
            {this.state.detailsModalOpened
              ? this.state.locations[this.state.realtyDetailed].address
              : ''
            }
          </DetailsModalRealtyAddress>
          { this.renderDetailsImagesList() }
        </DetailsModalSecondDivision>
        <DetailsModalThirdDivision>
          <DetailsModalPrice>R$ {this.state.detailsModalOpened
            ? this.state.locations[this.state.realtyDetailed].price
            : 0
          }</DetailsModalPrice>
        </DetailsModalThirdDivision>
      </ModalContainer>
    </Modal>
  )

  render() {
    return (
      <Container>
        <StatusBar barStyle="light-content" />
        { this.renderConditionalsButtons() }
        { this.renderCameraModal() }
        { this.renderDataModal() }
        { this.renderDetailsModal() }
      </Container>
    );
  }
}