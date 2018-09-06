import React, { PureComponent } from 'react';
import { Image, View, Modal, SafeAreaView, Text, TouchableOpacity, Platform } from 'react-native';
import PropTypes from 'prop-types';
import ImageViewer from 'react-native-image-zoom-viewer';
import FastImage from 'react-native-fast-image';

export default class HTMLImage extends PureComponent {
    constructor (props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height,
            index: 0,
            modalVisible: false
        };
    }

    static propTypes = {
        source: PropTypes.object.isRequired,
        alt: PropTypes.string,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        style: Image.propTypes.style,
        imagesMaxWidth: PropTypes.number,
        imagesInitialDimensions: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number
        })
    }

    static defaultProps = {
        imagesInitialDimensions: {
            width: 100,
            height: 100
        }
    }

    componentDidMount () {
        this.getImageSize();
    }

    componentWillReceiveProps (nextProps) {
        this.getImageSize(nextProps);
    }

    getDimensionsFromStyle (style, height, width) {
        let styleWidth;
        let styleHeight;

        if (height) {
            styleHeight = height;
        }
        if (width) {
            styleWidth = width;
        }
        if (Array.isArray(style)) {
            style.forEach((styles) => {
                if (!width && styles['width']) {
                    styleWidth = styles['width'];
                }
                if (!height && styles['height']) {
                    styleHeight = styles['height'];
                }
            });
        } else {
            if (!width && style['width']) {
                styleWidth = style['width'];
            }
            if (!height && style['height']) {
                styleHeight = style['height'];
            }
        }

        return { styleWidth, styleHeight };
    }

    getImageSize (props = this.props) {
        const { source, imagesMaxWidth, style, height, width } = props;
        const { styleWidth, styleHeight } = this.getDimensionsFromStyle(style, height, width);

        if (styleWidth && styleHeight) {
            return this.setState({
                width: typeof styleWidth === 'string' && styleWidth.search('%') !== -1 ? styleWidth : parseInt(styleWidth, 10),
                height: typeof styleHeight === 'string' && styleHeight.search('%') !== -1 ? styleHeight : parseInt(styleHeight, 10)
            });
        }
        // Fetch image dimensions only if they aren't supplied or if with or height is missing
        Image.getSize(
            source.uri,
            (originalWidth, originalHeight) => {
                if (!imagesMaxWidth) {
                    return this.setState({ width: originalWidth, height: originalHeight });
                }
                const optimalWidth = imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
                const optimalHeight = (optimalWidth * originalHeight) / originalWidth;
                this.setState({ width: optimalWidth, height: optimalHeight, error: false });
            },
            () => {
                this.setState({ error: true });
            }
        );
    }

    _renderHeader () {
        return(
            <SafeAreaView style={{flexDirection:"row-reverse", position:"absolute", width:"100%"}}>
                <View style={{margin:13}}>
                    <TouchableOpacity
                        style={{
                        }}
                        onPress={() =>
                            this.setState({
                                modalVisible: false
                            })
                        }
                    >

                        <FastImage
                            style={{height: 16, width: 16, margin: 3}}
                            source={require("../assets/images/access-denied.png")}
                        />

                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        )
    }
    validImage (source, style, props = {}) {
        const images = [{
            // Simplest usage.
            url: source.uri,
            // You can pass props to <Image />.
            props: {
                source: source
            }
        }]
        console.log("modalVisible",this.state.modalVisible)
        return (
            <View>
                <TouchableOpacity onPress={()=>this.setState({modalVisible: true})}>
                  {Platform.OS === "ios" ?
                    <FastImage
                      source={source}
                      style={[style, { width: this.state.width, height: this.state.height }]}
                      {...props}
                    /> :
                    <Image
                      source={source}
                      style={[style, { width: this.state.width, height: this.state.height }]}
                      {...props}
                    />
                  }
                </TouchableOpacity>
                <Modal
                    visible={this.state.modalVisible}
                    transparent={true}
                    onRequestClose={() => this.setState({ modalVisible: false })}
                >
                    <ImageViewer
                        renderImage = {(props) => <FastImage {...props}/>}
                        renderIndicator={(currentIndex) => this._renderHeader()}
                        saveToLocalByLongPress={false}
                        imageUrls={images}
                        index={this.state.index}
                        onSwipeDown={() => {
                            this.setState({modalVisible:false});
                        }}
                        enableSwipeDown={true}
                    />
                </Modal>
            </View>
        );
    }

    get errorImage () {
        return (
            <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: 'lightgray', overflow: 'hidden', justifyContent: 'center' }}>
                { this.props.alt ? <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{ this.props.alt }</Text> : false }
            </View>
        );
    }

    render () {
        const { source, style, headers, passProps } = this.props;
        if (headers) {
            let src = {
                uri: source.uri,
                headers: headers
            }
            return !this.state.error ? this.validImage(src, style, passProps) : this.errorImage;
        }
        return !this.state.error ? this.validImage(source, style, passProps) : this.errorImage;
    }
}
