// @flow
import React from 'react'
import algoliasearch from 'algoliasearch/src/browser/builds/algoliasearchLite.js'

const placesClient = algoliasearch.initPlaces()
// placesClient.as.addAlgoliaAgent(`@terrencewwong/react-algolia-places ${version}`);

class Places extends React.Component<
  *,
  {
  suggestions: Object[],
  value: string
  }
  > {
  state = {
    suggestions: [],
    value: ''
  }

  handleChange = async (e: SyntheticInputEvent<*>) => {
    const value = e.target.value
    this.setState({ value })

    const suggestions = await placesClient.search({
      query: value
    })

    this.setState({ suggestions })
  }

  render () {
    return (
      <React.Fragment>
        <input
          onChange={this.handleChange}
          type='text'
          value={this.state.value}
        />
        <pre>{JSON.stringify(this.state.suggestions, null, 2)}</pre>
      </React.Fragment>
    )
  }
}
export default Places
