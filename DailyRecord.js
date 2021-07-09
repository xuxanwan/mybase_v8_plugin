    //sValidation=nyfjs
    //sCaption=每日记录
    //sHint=新建每日记录
    //sCategory=MainMenu.Tools
    //sPosition=Par-1
    //sCondition=CURDB; DBRW;
    //sID=toos.recordThought
    //sAppVerMin=8.0
    //sShortcutKey=
    //sAuthor=nealian
    
    var nyf = new CNyfDb(-1); //　-1表示当前数据库
    
    var _createItemIfNotExist = function (ssgPath, title, id) {
        logd("_createItemIfNotExist: ssgPath:" + ssgPath + " ===== title:" + title + "  id:" + id);
        var xChild = new CLocalFile(ssgPath);
        xChild.append(id);
        logd("_createItemIfNotExist: xChild" + xChild.toStr() + "  title:" + title)
        if (!nyf.entryExists(xChild.toStr())) {
            if (nyf.createFolder(xChild.toStr())) {
                if (title) {
                    nyf.setFolderHint(xChild.toStr(), title);
                }
            } else {
                return null;
            }
        }
        return xChild;
    };
    // 在ssgpath目录下新建一个目录，并设置标题为title
    var _insertItem = function (ssgPath, title) {
        logd("_insertItem=====ssgPath:" + ssgPath + "title:" + title);
        return _createItemIfNotExist(ssgPath, title, nyf.getChildEntry(ssgPath));
    };
    var thTitle = plugin.getLocaleMsg('ReocrdThoughts.thTitle', '思维片段') // 顶层目录标题
    var thRootPath = '/Organizer/data/'; //　根目录ssg地址
    var thId = '_thOuGhts'
    
    // 如果顶层目录不存在则新建
    var _createRootDirIfNotExist = function () {
        return _createItemIfNotExist(thRootPath, thTitle, thId);
    };
    
    // 调用输入框获得想法内容
    var _getThoughts = function () {
        // var title = plugin.getLocaleMsg('ReocrdThoughts.Input.title', '记录此刻的想法');
        // var label = plugin.getLocaleMsg('ReocrdThoughts.Input.label', '内容');
        // var thInput = input(title, [{
        //    sField: 'textarea',
        //    sLabel: label,
        //    bWordwrap: true,
        //    sInit: '',
        //    bRequired: true
        // }], { nMinSize: 500, bVert: true });
        // if (thInput) {
        //    return thInput[0].toString();
        // }
        // return null;
        return "abc";
    };
    
    // 在parentPath目录下通过子目录的标题找到子目录
    // 假定这些目录只由本插件添加而没有其它人为操作，那么目录的标题是唯一的
    var _findEntryByHint = function (parentPath, hint) {
        var folders = nyf.listFolders(parentPath);
        for (i in folders) {
            var leafNode = new CLocalFile(parentPath);
            leafNode.append(folders[i])
            if (nyf.getFolderHint(leafNode.toStr()) == hint) {
                logd("_findEntryByHint:  " + leafNode.toStr())
                return leafNode;
            }
        }
        return null;
    };
    
    // 删除空的条目
    var _removeEmptyDir = function (ssgpath) {
        // alert("_removeEmptyDir input:"+ssgpath)
        // if (nyf.getFolderCount(ssgpath) == 0) {
        //    alert("delete")
        //    nyf.deleteEntry(ssgpath);
        // } else {
        //    var folders = nyf.listFolders(ssgpath);
        //    alert("folders"+ folders.length)
        //    for (var i in folders) {
        //        alert("_removeEmptyDir ++ foreach _"+folders[i])
        //        var parent = new CLocalFile(ssgpath);
        //        _removeEmptyDir(parent.append(folders[i]));
        //    }
        // }
    };
    
    //　添加失败时进行回滚操作
    var _revertOnFail = function (failPath) {
        if (failPath) {
            nyf.deleteEntry(failPath);
        }
        _removeEmptyDir(thRootPath + thId);
    };
    //获取系统当前时间，字符串类型
    function getLocalTime(i, d) {
        //参数i为时区值数字，比如北京为东八区则输入+8,西5输入-5
        //参数d为要转换的时间(Date类型)
        if (typeof i !== 'number') return;
        var len = d.getTime();
        //本地时间与GMT时间的时间偏移差
        var offset = d.getTimezoneOffset() * 60000;
        //得到现在的格林尼治时间
        var utcTime = len + offset;
        return new Date(utcTime + 3600000 * i);
    }
    var thText = _getThoughts();
    if (thText && thText.length > 0) {
        if (_createRootDirIfNotExist()) {
            var curDate = new Date();
            var curYearFolder = _findEntryByHint(thRootPath + thId, curDate.getFullYear().toString());
            if (!curYearFolder) { //　不存在年目录
                logd("　不存在年目录,新建一个" + thRootPath + thId, curDate.getFullYear().toString())
                curYearFolder = _insertItem(thRootPath + thId, curDate.getFullYear().toString())
            }
            if (curYearFolder) {
                var curMonth = curDate.getMonth() + 1 + "月";
                var curMonthFolder = _findEntryByHint(curYearFolder.toStr(), curMonth.toString());
                if (!curMonthFolder) { //　不存在月目录
                    curMonthFolder = _insertItem(curYearFolder.toStr(), curMonth.toString());
                }
                if (curMonthFolder) {
                    var curDay =getLocalTime(8,curDate).toISOString().split('T')[0];
                    logd("curDay "+curDay)
                    var curDayFolder = _findEntryByHint(curMonthFolder.toStr(), curDay.toString());
                    if (!curDayFolder) { //　不存在日目录
                        curDayFolder = _insertItem(curMonthFolder.toStr(), curDay.toString());
                        if (curDayFolder.toStr()) {
                            if (nyf.linkCalendar(curDayFolder.toStr(), curDate, curDate, 0, 0)) { //建立日历关联
                                var xFn = new CLocalFile(curDayFolder.toStr());
                                xFn.append(plugin.getDefNoteFn('html')); //新建hmtl文档
                                var thHtml = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' +
                                    '<html>\n' +
                                    '<head>\n' +
                                    '</head>\n' +
                                    '<body><span style="font-family: \'Ubuntu Mono\'"><span style="white-space:pre"></span>' +
                                    thText + '</span>\n'
                                '</body>\n' +
                                    '</html>';
                                if (nyf.createTextFile(xFn.toStr(), thHtml) >= 0) {
                                    logd("xFn:" + xFn.toStr() + "----thhtml:" + thHtml);
                                    alert(plugin.getLocaleMsg('ReocrdThoughts.AddRecord.Success', '添加一条记录'))
                                    plugin.refreshOutline(-1, thRootPath);
                                    plugin.refreshCalendar(-1);
                                    plugin.refreshOverview(-1);
                                } else {
                                    _revertOnFail(curDayFolder.toStr());
                                    alert(plugin.getLocaleMsg('ReocrdThoughts.AddRecord.Fail', '添加记录失败'))
                                }
    
                            } else {
                                _revertOnFail(curDayFolder.toStr());
                                alert(plugin.getLocaleMsg('ReocrdThoughts.LinkCalendar.Fail', '建立日历关联失败'))
                            }
                        }
                    }else{
                        logd("访问已经打开的文件")
                        // curDayFolder.launch();
                        plugin.openInfoItem(-1, curDayFolder.toStr(), '', true);
                    }
    
    
                }
            }
            if (!curYearFolder || !curMonthFolder || !curDayFolder.toStr()) {
                _revertOnFail();
                alert(plugin.getLocaleMsg('ReocrdThoughts.CreateItem.Fail', '创建条目失败'));
            }
        } else {
            alert(plugin.getLocaleMsg('ReocrdThoughts.CreateRootDir.Fail', '创建根目录失败'));
        }
    }
    