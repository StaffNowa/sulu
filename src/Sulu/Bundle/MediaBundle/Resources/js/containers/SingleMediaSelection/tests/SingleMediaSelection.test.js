// @flow
import {mount, shallow} from 'enzyme';
import React from 'react';
import {extendObservable as mockExtendObservable, observable} from 'mobx';
import SingleItemSelection from 'sulu-admin-bundle/components/SingleItemSelection';
import SingleSelectionStore from 'sulu-admin-bundle/stores/SingleSelectionStore';
import SingleMediaSelection from '../SingleMediaSelection';
import SingleMediaSelectionOverlay from '../../SingleMediaSelectionOverlay';

jest.mock('sulu-admin-bundle/utils/Translator', () => ({
    translate: jest.fn((key) => key),
}));

jest.mock('../../SingleMediaSelectionOverlay', () => jest.fn(function() {
    return <div>single media selection overlay</div>;
}));

jest.mock('sulu-admin-bundle/stores/SingleSelectionStore', () => jest.fn());

test('Component should render without selected media', () => {
    const singleMediaSelection = shallow(
        <SingleMediaSelection locale={observable.box('en')} onChange={jest.fn()} value={undefined} />
    );

    expect(SingleSelectionStore).toBeCalledWith('media', undefined, expect.anything());
    expect(singleMediaSelection.render()).toMatchSnapshot();
});

test('Component should render with display options', () => {
    const singleMediaSelection = shallow(
        <SingleMediaSelection
            displayOptions={['top', 'bottom']}
            locale={observable.box('en')}
            onChange={jest.fn()}
            value={undefined}
        />
    );

    expect(singleMediaSelection.render()).toMatchSnapshot();
});

test('Component should render with display options and correctly selected icon', () => {
    const singleMediaSelection = shallow(
        <SingleMediaSelection
            displayOptions={['top', 'bottom']}
            locale={observable.box('en')}
            onChange={jest.fn()}
            value={{displayOption: 'left', id: undefined}}
        />
    );

    expect(singleMediaSelection.render()).toMatchSnapshot();
});

test('Component should render with selected media', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.item = {
            id: 33,
            title: 'test media',
            mimeType: 'image/jpeg',
            thumbnails: {
                'sulu-25x25': 'http://lorempixel.com/25/25',
            },
        };
    });

    const singleMediaSelection = shallow(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={jest.fn()}
            value={{displayOption: undefined, id: 33}}
        />
    );

    expect(SingleSelectionStore).toBeCalledWith('media', 33, expect.anything());
    expect(singleMediaSelection.render()).toMatchSnapshot();
});

test('Component should render with selected media without thumbnails with MimeTypeIndicator', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.item = {
            id: 33,
            title: 'test media',
            mimeType: 'application/pdf',
        };
    });

    const singleMediaSelection = shallow(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={jest.fn()}
            value={{displayOption: undefined, id: 33}}
        />
    );

    expect(SingleSelectionStore).toBeCalledWith('media', 33, expect.anything());
    expect(singleMediaSelection.render()).toMatchSnapshot();
});

test('Component should pass className to SingleItemSelection', () => {
    const singleMediaSelection = shallow(
        <SingleMediaSelection
            className="test"
            locale={observable.box('en')}
            onChange={jest.fn()}
            value={undefined}
        />
    );

    expect(singleMediaSelection.find(SingleItemSelection).prop('className')).toEqual('test');
});

test('Component should pass types to SingleMediaSelectionOverlay', () => {
    const singleMediaSelection = shallow(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={jest.fn()}
            types={['image', 'video']}
            value={undefined}
        />
    );

    expect(singleMediaSelection.find(SingleMediaSelectionOverlay).prop('types')).toEqual(['image', 'video']);
});

test('Click on media-button should open an overlay', () => {
    const singleMediaSelection = mount(
        <SingleMediaSelection locale={observable.box('en')} onChange={jest.fn()} value={undefined} />
    );

    expect(singleMediaSelection.find(SingleMediaSelectionOverlay).prop('open')).toEqual(false);
    singleMediaSelection.find('.button').simulate('click');
    expect(singleMediaSelection.find(SingleMediaSelectionOverlay).prop('open')).toEqual(true);
});

test('Click on remove-button should clear the selection store', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.item = {
            id: 33,
            title: 'test media',
            mimeType: 'image/jpeg',
            thumbnails: {
                'sulu-25x25': 'http://lorempixel.com/25/25',
            },
        };
        this.clear = jest.fn();
    });

    const singleMediaSelection = mount(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={jest.fn()}
            value={{displayOption: undefined, id: 33}}
        />
    );

    singleMediaSelection.find('.removeButton').simulate('click');
    expect(singleMediaSelection.instance().singleMediaSelectionStore.clear).toBeCalled();
});

test('Media that is selected in the overlay should be set to the selection store on confirm', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.set = jest.fn();
    });

    const singleMediaSelection = mount(
        <SingleMediaSelection locale={observable.box('en')} onChange={jest.fn()} value={undefined} />
    );

    singleMediaSelection.instance().handleOverlayConfirm({
        id: 22,
        title: 'test media',
        mimeType: 'image/jpeg',
        thumbnails: {
            'sulu-25x25': '/images/25x25/awesome.png',
        },
    });

    expect(singleMediaSelection.instance().singleMediaSelectionStore.set).toBeCalledWith(expect.objectContaining({
        id: 22,
        title: 'test media',
        mimeType: 'image/jpeg',
        thumbnails: {
            'sulu-25x25': '/images/25x25/awesome.png',
        },
    }));
});

test('Should call the onChange handler if the displayOption changes', () => {
    const changeSpy = jest.fn();

    const singleMediaSelection = mount(
        <SingleMediaSelection
            displayOptions={['left']}
            locale={observable.box('en')}
            onChange={changeSpy}
            value={undefined}
        />
    );

    singleMediaSelection.find('Button[icon="su-display-default"]').simulate('click');
    singleMediaSelection.find('Action[value="left"]').simulate('click');

    expect(changeSpy).toBeCalledWith({displayOption: 'left', id: undefined});
});

test('Should call given onChange handler if value of selection store changes', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.loadItem = jest.fn();
        mockExtendObservable(this, {
            item: undefined,
        });
    });

    const changeSpy = jest.fn();

    const singleMediaSelectionInstance = shallow(
        <SingleMediaSelection locale={observable.box('en')} onChange={changeSpy} value={undefined} />
    ).instance();

    expect(changeSpy).not.toBeCalled();
    singleMediaSelectionInstance.singleMediaSelectionStore.item = {
        id: 77,
        title: 'test media',
        mimeType: 'image/jpeg',
        thumbnails: {},
    };
    expect(changeSpy).toBeCalledWith({id: 77}, singleMediaSelectionInstance.singleMediaSelectionStore.item);
});

test('Should not call onChange callback if an unrelated observable that is accessed in the callback changes', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.loadItem = jest.fn();
        mockExtendObservable(this, {
            item: undefined,
        });
    });

    const unrelatedObservable = observable.box(22);
    const changeSpy = jest.fn(() => {
        jest.fn()(unrelatedObservable.get());
    });

    const singleMediaSelectionInstance = shallow(
        <SingleMediaSelection locale={observable.box('en')} onChange={changeSpy} value={undefined} />
    ).instance();

    // change callback should be called when item of the store mock changes
    singleMediaSelectionInstance.singleMediaSelectionStore.item = {id: 77, thumbnails: {}};
    expect(changeSpy).toBeCalledWith({id: 77}, singleMediaSelectionInstance.singleMediaSelectionStore.item);
    expect(changeSpy).toHaveBeenCalledTimes(1);

    // change callback should not be called when the unrelated observable changes
    unrelatedObservable.set(55);
    expect(changeSpy).toHaveBeenCalledTimes(1);
});

test('Should not call the onChange callback if the component props change', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.loadItem = jest.fn();
    });

    const changeSpy = jest.fn();

    const singleMediaSelection = shallow(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={changeSpy}
            value={{displayOption: undefined, id: 5}}
        />
    );

    singleMediaSelection.setProps({disabled: true});
    expect(changeSpy).not.toBeCalled();
});

test('Should not call the onItemClick callback if no item is available', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.item = undefined;
    });

    const itemClickSpy = jest.fn();

    const singleMediaSelection = mount(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={jest.fn()}
            onItemClick={itemClickSpy}
            value={{displayOption: undefined, id: 5}}
        />
    );

    singleMediaSelection.find('SingleItemSelection .item').simulate('click');
    expect(itemClickSpy).not.toBeCalled();
});

test('Should call the onItemClick callback if the item is clicked', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.item = {id: 6, mimeType: 'image/jpeg'};
    });

    const itemClickSpy = jest.fn();

    const singleMediaSelection = mount(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={jest.fn()}
            onItemClick={itemClickSpy}
            value={{displayOption: undefined, id: 5}}
        />
    );

    singleMediaSelection.find('SingleItemSelection .item').simulate('click');
    expect(itemClickSpy).toBeCalledWith(6, {id: 6, mimeType: 'image/jpeg'});
});

test('Should not call the loadItem callback if the component props id change to same value', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        this.loadItem = jest.fn();
    });

    const changeSpy = jest.fn();

    const singleMediaSelection = shallow(
        <SingleMediaSelection
            locale={observable.box('en')}
            onChange={changeSpy}
            value={{displayOption: undefined, id: 5}}
        />
    );

    singleMediaSelection.setProps({value: {id: 5}});
    expect(singleMediaSelection.instance().singleMediaSelectionStore.loadItem).not.toBeCalled();
});

test('Correct props should be passed to SingleItemSelection component', () => {
    const singleMediaSelection = shallow(
        <SingleMediaSelection
            disabled={true}
            locale={observable.box('en')}
            onChange={jest.fn()}
            valid={false}
            value={undefined}
        />
    );

    expect(singleMediaSelection.find(SingleItemSelection).prop('disabled')).toEqual(true);
    expect(singleMediaSelection.find(SingleItemSelection).prop('valid')).toEqual(false);
});

test('Set loading prop of SingleItemSelection component if SingleSelectionStore is loading', () => {
    // $FlowFixMe
    SingleSelectionStore.mockImplementationOnce(function() {
        mockExtendObservable(this, {
            loading: false,
        });
    });

    const singleMediaSelection = shallow(
        <SingleMediaSelection disabled={true} locale={observable.box('en')} onChange={jest.fn()} value={undefined} />
    );

    expect(singleMediaSelection.find(SingleItemSelection).prop('loading')).toEqual(false);
    singleMediaSelection.instance().singleMediaSelectionStore.loading = true;
    expect(singleMediaSelection.find(SingleItemSelection).prop('loading')).toEqual(true);
});
