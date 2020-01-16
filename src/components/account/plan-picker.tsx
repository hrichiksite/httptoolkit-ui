import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { styled, css } from "../../styles";
import { SubscriptionPlanCode, SubscriptionPlan } from "../../model/account/subscriptions";
import { Button, UnstyledButton, ButtonLink, SecondaryButton } from "../common/inputs";

const PlanPickerModal = styled.dialog`
    position: absolute;

    top: 50%;
    left: 50%;

    /* There's default styling for dialog, so undo it: */
    bottom: auto;
    right: auto;

    transform: translate(-50%, -50%);
    z-index: 99;

    display: flex;
    flex-direction: row;
    color: ${p => p.theme.mainBackground};

    background-color: transparent;
    border: none;
`;

const PlanPickerDetails = styled.section`
    display: flex;
    flex-direction: column;
    justify-content: center;

    padding-right: 20px;
    max-width: 400px;
`;

const PlanPickerHeading = styled.h1`
    font-size: ${p => p.theme.loudHeadingSize};
    font-weight: bold;
    letter-spacing: -1px;
    text-align: center;
`;

const PlanCycleToggle = styled(UnstyledButton)`
    background: none;
    border: none;

    margin: 10px auto;
    padding: 10px 10px;

    font-family: ${p => p.theme.fontFamily};
    font-size: ${p => p.theme.headingSize};
    color: ${p => p.theme.mainBackground};

    display: flex;
    align-items: center;
    flex-direction: row;

    cursor: pointer;

    > svg {
        margin: 0 10px;
    }
`;

const PlanCycle = styled.span<{selected: boolean}>`
    ${p => p.selected && css`
        text-decoration: underline;
    `}
    ${p => !p.selected && css`
        opacity: 0.7;
    `}
`;

const PlanPickerButtons = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;

    width: 300px;
    margin: 50px auto 0;
`;

const PlanSecondaryButton = styled(SecondaryButton)`
    &:not(:last-child) {
        margin-bottom: 10px;
    }

    &:not([disabled]) {
        color: ${p => p.theme.mainBackground};
        border-color: ${p => p.theme.mainBackground};
    }
`;

const Nowrap = styled.span`
    white-space: nowrap;
`;

const PricingTable = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    color: ${p => p.theme.mainColor};
    max-width: 830px;
`;

const PricingTier = styled.section<{ highlighted?: boolean }>`
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 10px 0 rgba(0,0,0,0.1);
    border-radius: 4px;
    border: 1px solid ${p => p.theme.containerBorder};

    > * {
        padding: 10px 20px;
    }

    flex: 1 1;

    ${p => p.highlighted ? css`
        background-color: ${p => p.theme.mainBackground};
        color: ${p => p.theme.mainColor};

        z-index: 1;
        margin: -15px -5px -15px 0;

        flex-basis: 1%;

        > ${TierHeader} {
            padding: 37.5px 0;
        }
    ` : css`
        background-color: ${p => p.theme.mainLowlightBackground};
        opacity: 0.9;
    `}
`;

const TierHeader = styled.div`
    width: 100%;
    padding: 30px 0;
    color: ${p => p.theme.popColor};
    text-align: center;
    font-weight: bold;
    font-size: ${p => p.theme.loudHeadingSize};
`;

const TierPriceBlock = styled.div`
    text-align: center;
    color: ${p => p.theme.mainColor};
    margin: 0 20px;
`;


const TierPrice = styled.div`
    font-size: ${p => p.theme.headingSize};
    color: ${p => p.theme.mainColor};
    font-weight: bold;
`;

const TierPriceCaveats = styled.small`
    display: block;
    font-size: 80%;
    opacity: 0.8;
`;

const TierLicense = styled.div`
    display: block;
    margin-top: 10px;
    font-size: ${p => p.theme.headingSize};
`;

const TierFeatures = styled.ul`
    padding: 40px 20px 30px;
    font-size: ${p => p.theme.textSize};
`;

const FeatureHeading = styled.li`
    margin-top: 20px;
    margin-left: 0;
    list-style-type: none;

    &:first-child {
        margin-top: 0;
    }
`;

const Feature = styled.li`
    &:not(:first-child) {
        margin-top: 20px;
    }

    strong {
        color: ${p => p.theme.popColor};
    }
`;

const SubFeature = styled(Feature)`
    list-style: circle;
    margin-left: 20px;
`;

const SubFeatures = styled.ul`
    margin-top: 20px;

    > ${SubFeature} {
        margin-top: 10px;
    }
`;

const PricingCTA = styled.div`
    margin-top: auto;
    margin-bottom: 10px;
    font-weight: bold;

    > ${Button} {
        text-align: center;
        width: 100%
    }
`;

const PlanSmallPrint = styled.div`
    color: ${p => p.theme.mainBackground};
    font-size: ${p => p.theme.textSize};

    margin-top: 10px;
    text-align: center;

    a {
        color: ${p => p.theme.mainBackground};
        font-weight: bold;
    }

    p {
        margin-top: 10px;
    }
`;

type PlanCycle = 'monthly' | 'annual';

interface PlanPickerProps {
    email?: string;
    plans: _.Dictionary<SubscriptionPlan>;
    onPlanPicked: (plan: SubscriptionPlanCode | undefined) => void;
    logOut: () => void;
    logIn: () => void;
}

@observer
export class PlanPicker extends React.Component<PlanPickerProps> {

    @observable
    planCycle: PlanCycle = 'monthly';

    render() {
        const { planCycle, toggleCycle, buyPlan, closePicker, getPlanMonthlyPrice } = this;
        const { email, logOut, logIn } = this.props;

        return <PlanPickerModal open>
            <PlanPickerDetails>
                <PlanPickerHeading>Choose your Plan</PlanPickerHeading>
                <PlanCycleToggle onClick={toggleCycle}>
                    <PlanCycle selected={planCycle === 'monthly'}>Monthly</PlanCycle>

                    <FontAwesomeIcon icon={['fas', planCycle === 'annual' ? 'toggle-on' : 'toggle-off']} />

                    <PlanCycle selected={planCycle === 'annual'}>Annual</PlanCycle>
                </PlanCycleToggle>

                <PlanSmallPrint>
                    { email && <p>
                        Logged in as <Nowrap>{ email }</Nowrap>.
                    </p> }
                    <p>
                        By subscribing to a paid plan, you accept <Nowrap>
                            <a href="https://httptoolkit.tech/terms-of-service">
                                the HTTP Toolkit Terms of Service
                            </a>
                        </Nowrap>.
                    </p>
                </PlanSmallPrint>

                <PlanPickerButtons>
                    {
                        email
                            ? <PlanSecondaryButton onClick={logOut}>Log out</PlanSecondaryButton>
                            : <PlanSecondaryButton onClick={logIn}>Log into existing account</PlanSecondaryButton>
                    }
                    <PlanSecondaryButton onClick={closePicker}>Cancel</PlanSecondaryButton>
                </PlanPickerButtons>
            </PlanPickerDetails>

            <PricingTable>
                <PricingTier highlighted={true}>
                    <TierHeader>
                        Professional
                    </TierHeader>
                    <TierPriceBlock>
                        <TierPrice>{getPlanMonthlyPrice('pro')} / month</TierPrice>
                        <TierPriceCaveats>
                            plus tax, paid {this.planCycle === 'annual' ? 'annually' : 'monthly'}
                        </TierPriceCaveats>
                        <TierLicense title='Licensed for a specific individual. See the terms of service for full details.'>
                            Personal user account
                        </TierLicense>
                    </TierPriceBlock>
                    <TierFeatures>
                        <Feature>
                            <strong>In-depth HTTP debugging tools</strong>, including compression
                            & caching performance analysis
                        </Feature>
                        <Feature>
                            <strong>Validation & documentation for 1400+ APIs</strong>,
                            from AWS to GitHub to Stripe, powered by OpenAPI
                        </Feature>
                        <Feature>
                            <strong>Automated HTTP mocking & rewriting</strong>, including fixed
                            responses, request forwarding, connection failures, timeouts & more
                        </Feature>
                        <Feature>
                            <strong>Import/export mock rules</strong>, to reuse & share your mock environments
                        </Feature>
                        <Feature>
                            <strong>Import/export collected traffic</strong>, as either <a
                                href="https://en.wikipedia.org/wiki/HAR_(file_format)"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                HARs
                            </a> or ready-to-use code for 20+ tools
                        </Feature>
                        <Feature>
                            <strong>Advanced customization</strong>, including port configuration,
                            whitelisted & client certificates, and UI themes
                        </Feature>
                        <Feature>
                            <strong>Support ongoing development!</strong>
                        </Feature>
                    </TierFeatures>
                    <PricingCTA>
                        <Button onClick={() => buyPlan('pro')}>
                            Get Pro Now
                        </Button>
                    </PricingCTA>
                </PricingTier>

                <PricingTier>
                    <TierHeader>
                        Team
                    </TierHeader>
                    <TierPriceBlock>
                        <TierPrice>{getPlanMonthlyPrice('team')} / user / month</TierPrice>
                        <TierPriceCaveats>
                            plus tax, paid {this.planCycle === 'annual' ? 'annually' : 'monthly'}
                        </TierPriceCaveats>
                        <TierLicense title='One team license, linked to many individuals, who can be added and removed. See the terms of service for details.'>
                            Team account
                        </TierLicense>
                    </TierPriceBlock>
                    <TierFeatures>
                        <FeatureHeading>
                            <em>All Professional features, and:</em>
                        </FeatureHeading>
                        <Feature>
                            <strong>Centralized billing</strong> to simplify payment for your team
                        </Feature>
                        <Feature>Licensed to your team, rather than individuals</Feature>
                        <Feature>Add or remove team members whenever you need to</Feature>
                        <Feature>
                            <strong>Team workspaces</strong> for low-friction collaboration <Nowrap>
                                (<em>coming soon</em>)
                            </Nowrap>
                        </Feature>
                        <FeatureHeading>
                            Options available on request:
                        </FeatureHeading>
                        <SubFeatures>
                            <SubFeature>Self-hosted infrastructure</SubFeature>
                            <SubFeature>Private support</SubFeature>
                            <SubFeature>Training & consultancy</SubFeature>
                            <SubFeature>Bulk discounts</SubFeature>
                        </SubFeatures>
                    </TierFeatures>
                    <PricingCTA>
                        <ButtonLink href='https://httptoolkit.tech/contact'>
                            Get in touch
                        </ButtonLink>
                    </PricingCTA>
                </PricingTier>
            </PricingTable>
        </PlanPickerModal>
    }

    @action.bound
    toggleCycle() {
        this.planCycle = this.planCycle === 'annual' ? 'monthly' : 'annual';
    }

    getPlanMonthlyPrice = (tierCode: string): string => {
        const planCode = this.getPlanCode(tierCode);
        const plan = this.props.plans[planCode];
        return plan.prices!.monthly;
    };

    getPlanCode = (tierCode: string) => {
        return `${tierCode}-${this.planCycle}` as SubscriptionPlanCode;
    }

    buyPlan = (tierCode: string) => {
        this.props.onPlanPicked(this.getPlanCode(tierCode));
    }

    closePicker = () => {
        this.props.onPlanPicked(undefined);
    }

}