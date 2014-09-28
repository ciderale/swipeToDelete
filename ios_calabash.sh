#!/bin/bash

#LANG/LC_ALL is important for ti calabash..
#locale stuff is important for communication
export LANG="en_US.UTF-8" 
export LC_ALL="en_US.UTF-8" 
export APP_BUNDLE_PATH=build/iphone/build/Debug-iphonesimulator/app8.app

if [ "$1" == "init" ]; then
    rm -rf build/iphone
    ti build --platform=iphone --build-only
    #the following is need currently existing bug 
    (cd build/iphone && yes | calabash-ios setup)
    cp cucumber.yml build/iphone/
    cp -r features build/iphone/
fi
echo -e "n\n" | ti calabash --platform=ios
#LANG="en_US.UTF-8" LC_ALL="en_US.UTF-8" APP_BUNDLE_PATH=build/iphone/build/Debug-iphonesimulator/app8.app cucumber -p ios
