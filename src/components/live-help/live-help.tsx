import { Component, Prop, State, Element } from '@stencil/core';
import FirebaseProvider from '../../services/firebase';
@Component({
  tag: 'live-help',
  styleUrl: 'live-help.css',
  shadow: true
})
export class LiveHelp {
  private firebaseService: FirebaseProvider = new FirebaseProvider();
  @Prop() organization: string = 'Live Help';
  @Prop() color: string = 'blue';
  @State() active: Boolean;
  @State() message: any;
  @State() preview: Boolean;
  @State() typing: Boolean;
  @State() messages: Array<any> = [];
  @Element() helpEl: HTMLElement;
  helperBody: HTMLElement;
  initialMessage: Boolean = true;
  id: any;
  componentDidLoad() {}

  getMessages() {
    this.firebaseService.getHelpResponseMessages(this.id).subscribe(
      (res: any) => {
        this.messages = res;
        setTimeout(() => {
          this.helperBody.scrollTo({
            top: this.helperBody.scrollHeight,
            behavior: 'smooth'
          });
        }, 1000);
      },
      err => {
        console.error(err);
      }
    );
  }

  setState(state: string) {
    if (state === 'open') {
      this.active = true;
      setTimeout(() => {
        this.helperBody = this.helpEl.shadowRoot.querySelector('#helperBody');
      }, 1000);
    } else {
      this.active = false;
    }
  }

  addMessage(message) {
    if (this.initialMessage) {
      this.id = Math.random()
        .toString(36)
        .substring(2);

      this.getMessages();
      this.firebaseService
        .initiateHelpRequest(this.id, message)
        .then(() => {
          this.preview = false;
          this.message = null;
          this.initialMessage = false;
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      this.preview = false;
      this.message = null;
      this.firebaseService
        .sendIssue(this.id, message)
        .then(() => {})
        .catch(err => {
          console.error(err);
        });
    }
  }

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
          <div class="helperbody" id="helperBody">
            {this.messages.map(
              msg =>
                msg.from == 'client' ? (
                  <div class="message mine">
                    <p>{msg.message}</p>
                  </div>
                ) : (
                  <div
                    class="message yours"
                    style={{ 'background-color': this.color }}
                  >
                    <p>{msg.message}</p>
                  </div>
                )
            )}

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
                  this.helperBody.scrollTo({
                    top: this.helperBody.scrollHeight,
                    behavior: 'smooth'
                  });
                }}
                onFocus={() => {
                  this.preview = true;
                }}
                onBlur={() => {
                  this.preview = false;
                }}
                onKeyPress={event => {
                  if (event.key === 'Enter' && this.message) {
                    this.addMessage({
                      message: this.message,
                      from: 'client'
                    });
                  }
                }}
              />
            </div>
            <div class="sendbtn">
              <button
                disabled={!this.message}
                onClick={() => {
                  this.addMessage({ message: this.message, from: 'client' });
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
