import React from 'react'
import PropTypes from 'prop-types'

const noop = n => n

const connect = Component => {
  class RefunkState extends React.Component {
    static childContextTypes = {
      state: PropTypes.object,
      update: PropTypes.func
    }

    static contextTypes = {
      state: PropTypes.object,
      update: PropTypes.func
    }

    static propTypes = {
      mapState: PropTypes.func
    }

    static defaultProps = {
      mapState: noop
    }

    constructor (props, context) {
      super()

      this.child = isChild(context)

      this.state = this.child ? null : {...props}

      this.functionalUpdate = (fn, cb) => {
        const { mapState = noop } = this.props
        const mapped = mapState(this.state)
        const next = typeof fn === 'function'
          ? fn(mapped)
          : fn
        this.setState(next, cb)
      }

      this.update = this.child
        ? context.update
        : this.functionalUpdate
    }

    getChildContext () {
      const { mapState = noop } = this.props
      return this.child ? this.context : {
        state: mapState(this.state),
        update: this.update
      }
    }

    render () {
      const { mapState = noop } = this.props
      const state = this.child ? this.context.state : this.state
      const props = mapState(state)

      return (
        <Component
          {...this.props}
          {...props}
          update={this.update}
        />
      )
    }
  }

  return RefunkState
}

const isChild = (context) => (
  typeof context.state === 'object'
  && typeof context.update === 'function'
)

export default connect
