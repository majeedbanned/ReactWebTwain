import React, { Suspense } from 'react';
import Dynamsoft from 'dwt';
import CryptoJS from 'crypto-js';
import queryString from 'query-string';
const DWTUserInterface = React.lazy(() => import('./dwt/DWTUserInterface'));

export default class DWT extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.features) {
            this.features = 0;
            this.props.features.map((value) => {
                if (this.featureSet[value]) this.features += this.featureSet[value];
                return this.features;
            });
            this.initialStatus = this.features - (this.features & 0b1100011);
        }
        this.state = {
            startTime: (new Date()).getTime(),
            unSupportedEnv: false,
            dwt: null,
            /** status
             * 0:  "Initializing..."
             * 1:  "Core Ready..." (scan)
             * 2:  "Camera Ready..."
             * 32: "BarcodeReader Ready..."
             * 64: "Uploader Ready..."
             */
            status: this.initialStatus,
            selected: [],
            buffer: {
                updated: false,
                count: 0,
                current: -1
            },
            zones: [],
            runtimeInfo: {
                curImageTimeStamp: null,
                showAbleWidth: 0,
                showAbleHeight: 0,
                ImageWidth: 0,
                ImageHeight: 0
            }
        };
    }
    featureSet = { scan: 0b1, camera: 0b10, load: 0b100, save: 0b1000, upload: 0b10000, barcode: 0b100000, uploader: 0b1000000};
    features = 0b1111111;
    initialStatus = 0;
    DWObject = null;
    containerId = 'dwtcontrolContainer';
    width = 585;
    height = 513;
    modulizeInstallJS() {
        let _DWT_Reconnect = Dynamsoft.DWT_Reconnect;
        Dynamsoft.DWT_Reconnect = (...args) => _DWT_Reconnect.call({ Dynamsoft: Dynamsoft }, ...args);
        let __show_install_dialog = Dynamsoft._show_install_dialog;
        Dynamsoft._show_install_dialog = (...args) => __show_install_dialog.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainOldPluginNotAllowedCallback = Dynamsoft.OnWebTwainOldPluginNotAllowedCallback;
        Dynamsoft.OnWebTwainOldPluginNotAllowedCallback = (...args) => _OnWebTwainOldPluginNotAllowedCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainNeedUpgradeCallback = Dynamsoft.OnWebTwainNeedUpgradeCallback;
        Dynamsoft.OnWebTwainNeedUpgradeCallback = (...args) => _OnWebTwainNeedUpgradeCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTwainPostExecuteCallback = Dynamsoft.OnWebTwainPostExecuteCallback;
        Dynamsoft.OnWebTwainPostExecuteCallback = (...args) => _OnWebTwainPostExecuteCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnRemoteWebTwainNotFoundCallback = Dynamsoft.OnRemoteWebTwainNotFoundCallback;
        Dynamsoft.OnRemoteWebTwainNotFoundCallback = (...args) => _OnRemoteWebTwainNotFoundCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnRemoteWebTwainNeedUpgradeCallback = Dynamsoft.OnRemoteWebTwainNeedUpgradeCallback;
        Dynamsoft.OnRemoteWebTwainNeedUpgradeCallback = (...args) => _OnRemoteWebTwainNeedUpgradeCallback.call({ Dynamsoft: Dynamsoft }, ...args);
        let _OnWebTWAINDllDownloadFailure = Dynamsoft.OnWebTWAINDllDownloadFailure;
        Dynamsoft.OnWebTWAINDllDownloadFailure = (...args) => _OnWebTWAINDllDownloadFailure.call({ Dynamsoft: Dynamsoft }, ...args);
    }
    componentDidMount() {
		var _this = this;
		Dynamsoft.Ready(function(){
			if (!Dynamsoft.Lib.env.bWin || !Dynamsoft.Lib.product.bHTML5Edition) {
               // _this.setState({ unSupportedEnv: true });
                _this.featureSet = { scan: 0b1, load: 0b100, save: 0b1000, upload: 0b10000, uploader: 0b1000000 };
                _this.features = 0b1011101;
                _this.initialStatus = 0;
            }
            if (_this.DWObject === null)
                _this.loadDWT(true);
		});
    }
    loadDWT(UseService) {
        Dynamsoft.OnLicenseError = function (message, errorCode) {
            if(errorCode == -2808)
              message = '<div style="padding:0">Sorry. Your product key has expired. You can purchase a full license at the <a target="_blank" href="https://www.dynamsoft.com/store/dynamic-web-twain/#DynamicWebTWAIN">online store</a>.</div><div style="padding:0">Or, you can try requesting a new product key at <a target="_blank" href="https://www.dynamsoft.com/customer/license/trialLicense?product=dwt&utm_source=in-product">this page</a>.</div><div style="padding:0">If you need any help, please <a target="_blank" href="https://www.dynamsoft.com/company/contact/">contact us</a>.</div>';
              Dynamsoft.DWT.ShowMessage(message, {
              width: 680,
              headerStyle: 2
            });
         };
        Dynamsoft.DWT.ResourcesPath = "/dwt-resources";
		Dynamsoft.DWT.ProductKey = 't01948AUAAEM5h7WNqy3M3ZDho97cf/kFrUoqEnWNU0735VF9Acv8Xdj5SU2iOOePylCpPxjg/miCpQD0T7/KpsPhwC239HvG48pJE5w83skw3okTnHTLCaEE0rA528t2Lh2gCDw3gI9yOACsgXyXE/Ay++6VoQBIA1gBWLsDakD3FSH4pg5eSkYb0/8S2nPSBCePd9YNMsaJE5x0yxkaRCwsPrzW5wbBunIKgDSAuwD+fmRNg8AZIA3gBmArIs7KF2IfMfc=;t01918AUAAGJeDgY37EisVXJ5NduXQC3N0V/xa6T3vDbdvVjwUOcfViWWe3HSHmhbMqCUFmPgcqnru+Vch89RNjkrIQbZF+B5nDl5gFP6OwX9nTTAybecgF+abjtts4ybB/AEvBZA9uuwA5QD21wK4G3X3jNDAnALkAYgrTlQCzhcRb35jDIg+d8rBzo7eYBT+jvzgPRx0gAn33LGgKiDCXG1YQsI5TcnAbgFyCFA/4esCghKgFuAVIA4VfVOfzp7MeE=';
        let innerLoad = (UseService) => {
            this.innerLoadDWT(UseService)
                .then(
                    _DWObject => {
                        this.DWObject = _DWObject;
                        if (this.DWObject.Viewer.bind(document.getElementById(this.containerId))) {
							this.DWObject.Viewer.width = this.width;
							this.DWObject.Viewer.height = this.height;
                            this.DWObject.Viewer.setViewMode(1, 1);
							this.DWObject.Viewer.show();
                            this.handleStatusChange(1);
                            this.setState({
                                dwt: this.DWObject
                            });
                            //this.DWObject = this.state.dwt;
                            if (this.DWObject) {
                                /**
                                 * NOTE: RemoveAll doesn't trigger bitmapchanged nor OnTopImageInTheViewChanged!!
                                 */
                                // this.DWObject.RegisterEvent("OnBitmapChanged", (changedIndex, changeType) => this.handleBufferChange(changedIndex, changeType));
                               
                                // this.DWObject.RegisterEvent('OnWebTwainReady', function () {
                                //     console.log('startttttt1t')

                                //     const DWObject =  this.DWObject.GetWebTwain('dwtcontrolContainer');
                                //     if (DWObject) {
                                //         console.log('starttttttt')
                                //     //   DWObject.LoadImage('path/to/your/default/document.pdf', function (success) {
                                //     //     if (success) {
                                //     //       console.log('Document loaded successfully.');
                                //     //     } else {
                                //     //       console.log('Failed to load document.');
                                //     //     }
                                //     //   });
                                //     }
                                //   });
                               
                               
                               
                               
                                this.DWObject.Viewer.on("topPageChanged", (index, bByScrollBar) => { 
									if (bByScrollBar || this.DWObject.isUsingActiveX()){
										this.go(index);
									}
								});
                                this.DWObject.RegisterEvent("OnPostTransfer", () => this.handleBufferChange());
                                this.DWObject.RegisterEvent("OnPostLoad", () => this.handleBufferChange());
								this.DWObject.RegisterEvent("OnBufferChanged", (e) => {
                                    if(e.action === 'shift' && e.currentId !==  -1){
                                        this.handleBufferChange()
                                    }
                                });
                                this.DWObject.RegisterEvent("OnPostAllTransfers", () => this.DWObject.CloseSource());
                                this.DWObject.Viewer.on('pageAreaSelected', (nImageIndex, rect) => {
                                    if (rect.length > 0) {
										let currentRect = rect[rect.length - 1];
										let oldZones = this.state.zones;
										if(rect.length === 1)
											oldZones = [];
										oldZones.push({ x: currentRect.x, y: currentRect.y, width: currentRect.width, height: currentRect.height });
										this.setState({ zones: oldZones });
									}
                                });
                                this.DWObject.Viewer.on('pageAreaUnselected', () => this.setState({ zones: [] }));
								this.DWObject.Viewer.on("click", () => { 
									this.handleBufferChange();
								});
                                if (Dynamsoft.Lib.env.bWin)
                                    this.DWObject.MouseShape = false;
                                this.handleBufferChange();

                                const obj=this.decodeHashedQueryStringToObject(this.props.page);
                                console.log('obj',obj)
                                this.DWObject.HTTPPort = 2020;
                            //    DWObject.HTTPDownload("https://ocr.persiangulfmall.com", "/uploaded/1717134444132.jpg", onSuccess, onFailure);

                        if(obj.mode==='edit')
                            {
                                this.DWObject.HTTPDownload("https://ocr.persiangulfmall.com", "/uploaded/"+obj.name, function (success) {
                                    if (success) {  
                                        console.log('Document loaded successfully.');
                                    } else {
                                        console.log('Failed to load document.');
                                    }
                                });
                            }
                            }
                        }
                    },
                    err => {
                        console.log(err);
                    }
                );
        };
        /**
        * ConnectToTheService is overwritten here for smoother install process.
        */
        Dynamsoft.DWT.ConnectToTheService = () => {
            innerLoad(UseService);
        };
        innerLoad(UseService);
    }
    innerLoadDWT(UseService) {
        return new Promise((res, rej) => {   

			if (UseService !== undefined)
				Dynamsoft.DWT.UseLocalService = UseService;
			this.modulizeInstallJS();
			let dwtInitialConfig = {
				WebTwainId: "dwtObject"
			};
			Dynamsoft.DWT.CreateDWTObjectEx(
				dwtInitialConfig,
				(_DWObject) => {
					res(_DWObject);
				},
				(errorString) => {
					rej(errorString)
				}
			);
        });
    }
    go(index) {
        this.DWObject.CurrentImageIndexInBuffer = index;
        this.handleBufferChange();
    }
    handleBufferChange(changedIndex, changeType) {
        let _updated = false;
        if (changeType === 4) {// Modified
            _updated = true;
        }
		
        let selection = this.DWObject.SelectedImagesIndices;
        this.setState({
            //zones: [],
            selected: selection,
            buffer: {
                updated: _updated,
                current: this.DWObject.CurrentImageIndexInBuffer,
                count: this.DWObject.HowManyImagesInBuffer
            }
        }, () => {
            if (this.state.buffer.count > 0) {
                this.setState({
                    runtimeInfo: {
                        curImageTimeStamp: (new Date()).getTime(),
                        showAbleWidth: (this.DWObject.HowManyImagesInBuffer > 1 ? this.width - 12 : this.width) -4,
                        showAbleHeight: this.height - 4,
                        ImageWidth: this.DWObject.GetImageWidth(this.state.buffer.current),
                        ImageHeight: this.DWObject.GetImageHeight(this.state.buffer.current)
                    }
                });
            }
        });
    }
    handleStatusChange(value) {
        this.setState((state) => { return { status: state.status + value } });
    }
    handleViewerSizeChange(viewSize) {
        this.width = viewSize.width;
        this.height = viewSize.height;
    }
     decodeHashedQueryStringToObject(hashedQueryString) {
        const bytes = CryptoJS.AES.decrypt(hashedQueryString, 'your-secret-key');
        const qs = bytes.toString(CryptoJS.enc.Utf8);
        const decodedObject = queryString.parse(qs);
      
        // Convert numeric values back to numbers
        for (let key in decodedObject) {
          if (!isNaN(decodedObject[key])) {
            decodedObject[key] = Number(decodedObject[key]);
          }
        }
      
        return decodedObject;
      }
    render() {
        return (
            <div>
                <Suspense fallback={<div>Loading...</div>}>
                    <DWTUserInterface
                        page={this.props.page}
                        Dynamsoft={Dynamsoft}
                        features={this.features}
                        containerId={this.containerId}
                        startTime={this.state.startTime}
                        dwt={this.state.dwt}
                        status={this.state.status}
                        buffer={this.state.buffer}
                        selected={this.state.selected}
                        zones={this.state.zones}
                        runtimeInfo={this.state.runtimeInfo}
                        handleViewerSizeChange={(viewSize) => this.handleViewerSizeChange(viewSize)}
                        handleStatusChange={(value) => this.handleStatusChange(value)}
                        handleBufferChange={() => this.handleBufferChange()}
                    /></Suspense>
            </div>
        );
    }
}
