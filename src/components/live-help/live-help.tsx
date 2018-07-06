import { Component, Prop, State } from '@stencil/core';

@Component({
  tag: 'live-help',
  styleUrl: 'live-help.css',
  shadow: true
})
export class LiveHelp {
  @Prop() organization: any;
  @Prop() last: String;

  @State() active: Boolean;
  @State() message: any;
  @State() preview: Boolean;

  setState(state: String) {
    if (state === 'open') {
      this.active = true;
    } else {
      this.active = false;
    }
  }

  addMessage() {
    console.log(this.message);
  }

  componentWillLoad() {}
  render() {
    if (this.active) {
      return (
        <div id="helper">
          <div class="helperheader">
            {this.organization ? (
              <div class="heading">{this.organization}</div>
            ) : (
              <div />
            )}

            <div onClick={() => this.setState('close')} class="close">
              X
            </div>
          </div>
          <div class="helperbody">
            <div class="message mine">
              <p>
                Welcome Would You Like Some Help? Chat with one of our Support
                Team Members
              </p>
            </div>
            <div class="message yours">
              <p>
                Welcome Would You Like Some Help? Chat with one of our Support
                Team Members
              </p>
            </div>

            {(this.preview && this.message) ||
            (!this.preview && this.message) ? (
              <div class="message yours">
                <p>{this.message}</p>
              </div>
            ) : (
              <div />
            )}
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
                    this.addMessage();
                  }
                }}
              />
            </div>
            <div class="sendbtn">
              <button
                disabled={!this.message}
                onClick={() => {
                  this.addMessage();
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div onClick={() => this.setState('open')} id="init">
          Get Help?
        </div>
      );
    }
  }
}
