import './GuideButton.scss';

import React from 'react';
import Modal from 'react-modal';

/**
 * React props for {@link GuideButton}.
 *
 * @interface GuideButtonProps
 */
interface GuideButtonProps {
    onClick: () => void,
};

/**
 * React state for {@link GuideButton}.
 *
 * @interface GuideButtonState
 */
interface GuideButtonState {
    modalOpen: boolean,
    warningAcknowledged: boolean,
}

/**
 * The button that opens {@link Guide}.
 *
 * @param {GuideButtonProps} props
 * @returns {JSX.Element}
 */
class GuideButton extends React.Component<GuideButtonProps, GuideButtonState> {
    /**
     * Creates an instance of GuideButton.
     * 
     * @param {GuideButtonProps} props
     * @memberof GuideButton
     */
    constructor(props: GuideButtonProps) {
        super(props);

        this.state = {
            modalOpen: false,
            warningAcknowledged: false,
        };
    }

    /**
     * Called by React to render the component.
     *
     * @memberof GuideButton
     */
    public render = (): JSX.Element => {
        return (
            <React.Fragment>
                <div id="guide-link">
                    <button onClick={this.handleClick}>•••</button>
                </div>
                <Modal
                    className="warning-modal"
                    contentLabel="Warning"
                    isOpen={this.state.modalOpen}
                    onRequestClose={this.closeModal}
                    overlayClassName="warning-modal-overlay"
                >
                    <div className="warning-content">
                        <div className="warning-heading">Warning</div>
                        <div className="warning-body">
                            <p>This button opens the Dungeon Master's guide to
                            the tarokka reading, which contains <em>massive
                            spoilers</em> for players of <i>Curse of
                            Strahd</i>. Be careful not to ruin the game for
                            yourself or others!</p>

                            <p>Are you a Dungeon Master running <i>Curse of
                            Strahd</i>?</p>
                        </div>
                    </div>
                    <div className="warning-buttons">
                        <button onClick={this.acknowledgeWarningAndOpenGuide}>Yes</button>
                        <button onClick={this.closeModal}>No</button>
                    </div>
                </Modal>
            </React.Fragment>
        );
    };

    /**
     * Sets the warning modal as acknowledged and opens the guide.
     * The acknowledgment lasts until the page is reloaded.
     *
     * @private
     * @memberof GuideButton
     */
    private acknowledgeWarningAndOpenGuide = (): void => {
        this.setState({
            modalOpen: false,
            warningAcknowledged: true,
        });

        window.open('/guide', 'tarokka');
    };

    /**
     * Closes the warning modal.
     *
     * @private
     * @memberof GuideButton
     */
    private closeModal = (): void => {
        this.setState({modalOpen: false});
    };

    /**
     * Handles the Dungeon Master's guide button click.
     *
     * @private
     * @memberof GuideButton
     */
    private handleClick = (): void => {
        if (this.state.warningAcknowledged) {
            this.openGuide();
        } else {
            this.openModal();
        }
    };

    /**
     * Opens the Dungeon Master's guide.
     *
     * @private
     * @memberof GuideButton
     */
    private openGuide = (): void => {
        window.open('/guide', 'tarokka');
    };

    /**
     * Opens the warning modal.
     *
     * @private
     * @memberof GuideButton
     */
    private openModal = (): void => {
        this.setState({modalOpen: true});
    };
}

export default GuideButton;
