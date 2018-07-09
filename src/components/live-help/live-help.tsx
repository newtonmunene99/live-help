import { Component, Prop, State } from '@stencil/core';

@Component({
  tag: 'live-help',
  styleUrl: 'live-help.css',
  shadow: true
})
export class LiveHelp {
  @Prop() organization: string = 'Live Help';
  @Prop() color: string = 'blue';

  @State() active: Boolean;
  @State() message: any;
  @State() preview: Boolean;
  @State() typing: Boolean;

  setState(state: string) {
    if (state === 'open') {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  addMessage(message) {
    fetch('', {
      method: 'POST',
      body: JSON.stringify({
        message: message
      })
    })
      .then(res => {
        console.log(res.json());
      })
      .catch(err => {
        console.error(err);
      });
  }

  componentWillLoad() {}
  render() {
    if (this.active) {
      return (
        <div id="helper">
          <div class="helperheader">
            {this.organization ? (
              <div class="heading" style={{ 'background-color': this.color }}>
                {this.organization}
              </div>
            ) : null}

            <div
              onClick={() => this.setState('close')}
              class="close"
              style={{ 'background-color': this.color }}
            >
              X
            </div>
          </div>
          <div class="helperbody">
            <div
              class="message yours"
              style={{ 'background-color': this.color }}
            >
              <p>
                Welcome Would You Like Some Help? Chat with one of our Support
                Team Members
              </p>
            </div>
            <div class="message mine">
              <p>Yes I would Like Some help. Thank You Very Much</p>
            </div>
            <div
              class="message yours"
              style={{ 'background-color': this.color }}
            >
              <p>Please tell us more about your problem</p>
            </div>
            {this.typing ? (
              <div
                class="message yours"
                style={{ 'background-color': this.color }}
              >
                <p>Typing ...</p>
              </div>
            ) : null}

            {(this.preview && this.message) ||
            (!this.preview && this.message) ? (
              <div class="message mine">
                <p>{this.message}</p>
              </div>
            ) : null}
          </div>
          <div class="helperfooter">
            <div class="input">
              <input
                autocapitalize="true"
                autocorrect="true"
                autosave="true"
                spellcheck="true"
                type="text"
                name="message"
                placeholder="Input your message here."
                id="messageinput"
                value={this.message}
                onInput={(event: any) => {
                  this.message = event.target.value;
                }}
                onFocus={() => {
                  this.preview = true;
                }}
                onBlur={() => {
                  this.preview = false;
                }}
                onKeyPress={event => {
                  if (event.key === 'Enter' && this.message) {
                    this.addMessage(this.message);
                  }
                }}
              />
            </div>
            <div class="sendbtn">
              <button
                disabled={!this.message}
                onClick={() => {
                  this.addMessage(this.message);
                }}
                style={{ 'background-color': this.color }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div
          onClick={() => this.setState('open')}
          style={{ 'background-color': this.color }}
          id="init"
        >
          Get Help?
        </div>
      );
    }
  }
}
