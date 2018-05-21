// @flow

import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions';
import Places from '../src'

class PlacesDemo extends React.Component<*, {
  value: string
}> {
  state = {
    value: ""
  }

  handleChange = (value: string) => {
    this.setState({ value })
    action('onChange')
  }

  render () {
    return (
      <Places
        onChange={this.handleChange}
        value={this.state.value}
      >
        {({ getInputProps, getSuggestionItemProps, suggestions }) => (
          <div>
            <input {...getInputProps()} />
            <div>
              {suggestions.map(suggestion => (
                <div {...getSuggestionItemProps(suggestion)}>
                  <pre>{JSON.stringify(suggestion, null, 2)}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </Places>
    )
  }
}

storiesOf('Places', module).add('default', () => <PlacesDemo />)
