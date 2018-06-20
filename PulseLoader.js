import React, { Component } from 'react'
import { View, Image, TouchableOpacity, Animated, Easing } from 'react-native'
import Pulse from './Pulse'
import PropTypes from 'prop-types'

export default class LocationPulseLoader extends Component {
	static PropTypes = {
	  interval: PropTypes.number,
	  size: PropTypes.number,
	  pulseMaxSize: PropTypes.number,
	  avatar: PropTypes.any.isRequired,
	  avatarBackgroundColor: PropTypes.string,
	  pressInValue: PropTypes.number,
	  pressDuration: PropTypes.number,
	  borderColor: PropTypes.string,
	  backgroundColor: PropTypes.string,
	  getStyle: PropTypes.func,
	}

	static defaultProps = {
	  interval: 2000,
	  size: 100,
	  pulseMaxSize: 250,
	  avatar: undefined,
	  avatarBackgroundColor: 'white',
	  pressInValue: 0.8,
	  pressDuration: 150,
	  pressInEasing: Easing.in,
	  pressOutEasing: Easing.in,
	  borderColor: '#D8335B',
	  backgroundColor: '#ED225B55',
	  getStyle: undefined,
		autoPress: true,
		autoPressInterval: 500,
		imageRotate: true
	}

	constructor(props) {
		super(props)

		this.state = {
			circles: []
		}

		this.counter = 1
		this.setInterval = null
		this.anim = new Animated.Value(1)
		this.spinValue = new Animated.Value(0)
	}

	componentDidMount() {
		this.setCircleInterval()
		if (this.props.autoPress === true) {
			this.setAutoPress()
		}
		if (this.props.imageRotate === true) {
			this.startRotate()
		}
	}

	componentWillUnmount() {
		clearInterval(this.setInterval)
		clearInterval(this.intervalAuto)
	}

	startRotate = () => {
		Animated.sequence([
			Animated.timing(this.spinValue, {
	      toValue: 1,
	      duration: 3000,
	      easing: Easing.linear,
	      useNativeDriver: true
	    }),
			Animated.timing(this.spinValue, {
	      toValue: 0,
	      duration: 0,
	      useNativeDriver: true
	    })
	  ]).start(() => {
	    this.startRotate()
	  })
	}

	setCircleInterval() {
		this.setInterval = setInterval(this.addCircle.bind(this), this.props.interval)
		this.addCircle()
	}

	addCircle() {
		this.setState({ circles: [...this.state.circles, this.counter] })
		this.counter++
	}

	onPressIn = () => {
		Animated.timing(this.anim, {
			toValue: this.props.pressInValue,
			duration: this.props.pressDuration,
			easing: this.props.pressInEasing,
			useNativeDriver: true
		}).start(() => clearInterval(this.setInterval))
	}

	onPressOut = () => {
		Animated.timing(this.anim, {
			toValue: 1,
			duration: this.props.pressDuration,
			easing: this.props.pressOutEasing,
			useNativeDriver: true
		}).start(this.setCircleInterval.bind(this))
	}

	setAutoPress = () => {
		clearInterval(this.intervalAuto)
		this.intervalAuto = setInterval(() => {
			this.onPressIn()
			this.onPressOut()
		}, this.props.autoPressInterval)
	}

	onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout
    this.setState({ width, height, finish: true })
  }

	render() {
		const { size, avatar, avatarBackgroundColor, interval } = this.props
		const { finish, circles, width, height } = this.state

		const spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    })

		return (
			<View
				onLayout={this.onPageLayout}
				style={{
					flex: 1,
					backgroundColor: 'transparent',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
				{finish && circles.map((circle) => (
					<Pulse
						key={circle}
						parentWidth={width}
						parentHeight={height}
						{...this.props}
					/>
				))}

				<TouchableOpacity
					activeOpacity={1}
					onPressIn={this.onPressIn}
					onPressOut={this.onPressOut}
					style={{
						transform: [{
							scale: this.anim
						}]
					}}
				>
					<Animated.Image
						source={avatar}
						style={{
							width: size,
							height: size,
							borderRadius: size/2,
							backgroundColor: avatarBackgroundColor,
							transform: [{ rotate: spin }]
						}}
					/>
				</TouchableOpacity>
			</View>
		)
	}
}
