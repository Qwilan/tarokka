import './Guide.scss';

import {BroadcastChannel} from 'broadcast-channel';
import React from 'react';
import nl2br from 'react-nl2br';

/**
 * React props for {@link Guide}.
 *
 * @interface GuideProps
 */
interface GuideProps {};

/**
 * React state for {@link Guide}.
 *
 * @interface GuideState
 */
interface GuideState {
    draws: Array<HighCard | LowCard>,
    spread: SpreadCard[],
};

/**
 * Expected broadcast message from {@link Spread}.
 *
 * @interface MessageEvent
 */
interface MessageEvent {
    draws: Array<HighCard | LowCard>,
    spread: SpreadCard[],
};

/**
 * The guide, or Dungeon Master view, for a given tarokka reading.
 *
 * @class Guide
 * @extends {React.Component<GuideProps, GuideState>}
 */
class Guide extends React.Component<GuideProps, GuideState> {
    /**
     * Broadcast channel used to communicate with {@link Spread}.
     *
     * @private
     * @type {BroadcastChannel}
     * @memberof Guide
     * @see Spread
     */
    private channel: BroadcastChannel = new BroadcastChannel('tarokka');

    /**
     * Reference to the timeout function for requesting data from {@link Spread}.
     *
     * @private
     * @type {(ReturnType<typeof setTimeout> | undefined)}
     * @memberof Guide
     */
    private timeout: ReturnType<typeof setTimeout> | undefined;

    /**
     * Creates an instance of Guide.
     * 
     * @param {GuideProps} props
     * @memberof Guide
     */
    constructor(props: GuideProps) {
        super(props);

        this.state = {
            draws: [],
            spread: [],
        };
    }

    /**
     * Called by React after component is inserted into the DOM tree.
     *
     * @memberof Guide
     */
    public componentDidMount = (): void => {
        this.channel.onmessage = this.handleMessage;

        if (this.state.draws.length === 0 || this.state.spread.length === 0) {
            this.timeout = setTimeout(this.requestData, 100);
        }
    };

    /**
     * Called by React to render the component.
     *
     * @memberof Guide
     */
    public render = (): JSX.Element => {
        return (
            <div id="guide">
                {this.state.spread.map(this.renderCard)}
            </div>
        );
    };

    /**
     * Requests data from {@link Spread}.
     *
     * @private
     * @memberof Guide
     */
    private requestData = (): void => {
        this.channel.postMessage(true);
    };

    /**
     * Receives broadcasts from {@link Spread} and updates the state
     * accordingly.
     *
     * @private
     * @memberof Guide
     */
    private handleMessage = (event: MessageEvent): void => {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.setState({
            draws: event.draws,
            spread: event.spread,
        });
    };

    /**
     * Renders text for the Strahd's Enemy card (i.e., an ally against Strahd).
     *
     * @private
     * @memberof Guide
     */
    private renderAllyText = (card: SpreadCard, draw: HighCard): JSX.Element => {
        const multiple = draw.alliesText.length > 1;

        return (
            <ol>
                <li>{this.say(card.secretText)}</li>
                <li>{this.reveal(draw.name)}</li>
                <li>
                    {!multiple && (
                        <React.Fragment>
                            {draw.alliesText.map((allyText, i) => (
                                <React.Fragment key={draw.allies[i]}>
                                    <div>{this.say(draw.alliesText[i])}</div>
                                    <div className="secret">
                                        {nl2br(draw.alliesSecretText[i])}
                                    </div>
                                </React.Fragment>
                            ))}
                        </React.Fragment>
                    )}
                    {multiple && (
                        <React.Fragment>
                            Pick one: {draw.allies.join(' or ')}:
                            <ol type="a">
                                {draw.alliesText.map((allyText, i) => (
                                    <li key={draw.allies[i]}>
                                        {multiple && (
                                            <div><em>{draw.allies[i]}.</em></div>
                                        )}
                                        <div>{this.say(draw.alliesText[i])}</div>
                                        <div className="secret">
                                            {nl2br(draw.alliesSecretText[i])}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </React.Fragment>
                    )}
                </li>
            </ol>
        );
    };

    /**
     * Renders a card given its spread placement.
     *
     * @private
     * @memberof Guide
     */
    private renderCard = (card: SpreadCard, index: number): JSX.Element => {
        let article = '';
        let description: JSX.Element;

        switch (card.key) {
            case 'ally':
                description = this.renderAllyText(
                    card,
                    this.state.draws[index] as HighCard,
                );
                break;
            case 'strahd':
                description = this.renderStrahdText(
                    card,
                    this.state.draws[index] as HighCard,
                );
                break;
            default:
                article = 'The ';
                description = this.renderTreasureText(
                    card,
                    this.state.draws[index] as LowCard,
                );
        }

        return (
            <div key={card.name}>
                <h2>{article}{card.name}</h2>
                {description}
            </div>
        );
    };

    /**
     * Renders text for the Strahd card.
     *
     * @private
     * @memberof Guide
     */
    private renderStrahdText = (card: SpreadCard, draw: HighCard): JSX.Element => (
        <ol>
            <li>{this.say(card.secretText)}</li>
            <li>{this.reveal(draw.name)}</li>
            <li>
                <div>{this.say(draw.strahdText)}</div>
                <div className="secret">{nl2br(draw.strahdSecretText)}</div>
            </li>
        </ol>
    );

    /**
     * Renders text for the various treasure cards.
     *
     * @private
     * @memberof Guide
     */
    private renderTreasureText = (card: SpreadCard, draw: LowCard): JSX.Element => (
        <ol>
            <li>{this.say(card.secretText)}</li>
            <li>
                {this.reveal(`
                    ${draw.value === 10 ? 'Master' : draw.value}
                    of ${draw.suit} — The ${draw.name}
                `)}
            </li>
            <li>
                <div>{this.say(draw.text)}</div>
                <div className="secret">
                    {nl2br(draw.secretText.replace('treasure', card.name))}
                </div>
            </li>
        </ol>
    );

    /**
     * Helper to indicate when to turn a card over.
     *
     * @private
     * @memberof Guide
     */
    private reveal = (text: string): JSX.Element => {
        return <span><strong>Reveal:</strong> The {text}</span>;
    };

    /**
     * Helper to indicate when to say flavor text.
     *
     * @private
     * @memberof Guide
     */
    private say = (text: string): JSX.Element => {
        return <span><strong>Say:</strong> "{text}"</span>;
    };
}

export default Guide;
