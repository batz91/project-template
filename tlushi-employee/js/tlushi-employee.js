var employeeAPI = function() {
    var angle = 0;      // for rotate

//  VARIABLES 
    var minHour;   // שכר מינימום לשעה
    var minMonth; // שכר מינימום חודשי
    var travelDay;   // נסיעות ליום  
    var weekHours;    // שעות שבועיות
    var daysHolidayArray;      // ימי חופשה לפי ותק
    var daysRecoveryArray;  // ימי הבראה לפי ותק
    var currentEmail;
    var salaryOutPut;
    var extraHouresOutPut;
    var travelFeesOutPut;
    var employeePensionOutPut;
    var employerPensionOutPut;
    var daysRecoveryOutPut;
    var deductionsOutPut;
    var daysHolidayOutPut;
    var outPutSum=0;
//	Create the initial appearance of the site
	var initModule = function() {
        var database = firebase.database();
        var leadsRef = database.ref('Settings');
        leadsRef.on('value', function(snapshot) { 
            snapshot.forEach(function(childSnapshot) {             
            var childData = childSnapshot.val();
            minHour= parseFloat(childData.minHour);
            minMonth= parseFloat(childData.minMonth);
            travelDay= parseFloat(childData.travelDay);
            weekHours= parseFloat(childData.weekHours);
            daysHolidayArray= childData.daysOff;
            daysRecoveryArray= childData.daysRecovery;
            });
        });
		$("#butCalc").click(calc);
        $("#fileInput").click(openPic);
        $("#fileProgress").click(openProgress);
        $("#fileProgressUpload").click(uploadInProgress);
        $('#zoom-in').click({msg: 'pic'},zoomIn); 
        $('#zoom-out').click({msg: 'pic'},zoomOut);
        $('#reset-zoom').click({msg: 'pic'},zoomReset);
        $('#rotate').click(rotate);
        $('#buttonLogInAdmin').click(buttonPopUp);
        $('#forgetPassword').click(forgetPassword);
        $('#signUpAdmin').click(signUpAdmin);
    };
    // הרשרמת מנהל נוסף
    var signUpAdmin= function(){
         var email =$("#emailAdmin").val();
        var password = $("#passwordAdmin").val();
      firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
          var newEmail= window.prompt("הכנס אימייל ליצירת משתמש");
          var newPassword= window.prompt("הכנס סיסמא (אורך הסיסמא לפחות 6 תווים)");
          var newPasswordRe= window.prompt("חזור על הסיסמא");
          if(newPassword != newPasswordRe || newPassword.length < 6){
              alert("סיסמא לא תקינה");
              return false;
          }
          else{
            firebase.auth().createUserWithEmailAndPassword(newEmail, newPassword).then(function(){
                alert("נוצר משתמש חדש");
            }).catch(function(error){
             // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
            // ...
            });
          }
          }).catch(function(error) {
            // Handle Errors here.
            alert("להרשמת מנהל חדש יש להכניס אימייל וסיסמא של מנהל נוכחי")
            // ...
        });
        return false;
    }

    // מנהל שכח סיסמא
    var forgetPassword= function(){
        var auth = firebase.auth();
        var email =$("#emailAdmin").val();
        auth.sendPasswordResetEmail(email).then(function() {
            alert("נשלח אימייל לשחזור סיסמא")
        // Email sent.
    }, function(error) {
        // An error happened.
         var errorCode = error.code;
         var errorMessage = error.message;
        // alert(errorCode);
         alert(errorMessage);
        });
    }

    // עידכון המשתנים הקבועים במסד נתונים
    var updateAdminValues= function(){
        var holidayArray = ($("#txtDaysHolidayArray").val().split(",")).map(Number);
        var recoveryArray = ($("#txtDaysRecoveryArray").val().split(",")).map(Number);
        var database = firebase.database();
        var leadsRef = database.ref('Settings');
        leadsRef.on('value', function(snapshot) { 
            snapshot.forEach(function(childSnapshot) {             
            var childData = childSnapshot.val();
            var key=childSnapshot.key;
            database.ref("Settings/"+key+"/minHour").set(parseFloat($("#txtSettingsMinHour").val()));
            database.ref("Settings/"+key+"/minMonth").set(parseFloat($("#txtSettingsMinMounth").val()));
            database.ref("Settings/"+key+"/travelDay").set(parseFloat($("#txtTravelDay").val()));
            database.ref("Settings/"+key+"/weekHours").set(parseFloat($("#txtSettingsWeekHours").val()));
            database.ref("Settings/"+key+"/daysOff").set(holidayArray);                  
            database.ref("Settings/"+key+"/daysRecovery").set(recoveryArray);                  
            });
        });
        alert("השינויים בוצעו בהצלחה");
        location.reload();        
    }
    // הצגת הדף למנהל עם עידכון הפרטים האפשריים

    var findEndForm= function(){
        if($("#txtFindForm").val() == undefined)
        {
            alert('הכנס אימייל לקוח');
            return;
        }
        var database = firebase.database();
        var leadsRef = database.ref('user');
        leadsRef.on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {                     
                var childData = childSnapshot.val();
                if($("#txtFindForm").val() == childData.email && childData.status == "done")
                {
                    var preview = document.getElementById('loadFormAdmin'); //selects the query named img
                    preview.src = childData.paycheck;
                }
             });
        });
    };

    var adminSettings= function(){
        var content= "<div class='tab'>"+
                        "<button class='tablinks' id='defaultOpen'>משתנים</button>"+
                        "<button class='tablinks' id='showReportsId'>צפיה בדוחות</button>"+
                     "</div>"+
                     "<div id='changeValues' class='tabcontent'>"+
                        "<label>שכר מינימום לשעה:</label>"+
                        "<input type='number' class='textPopUp' id='txtSettingsMinHour' step='0.01' required>"+
                        "<label>שכר מינימום חודשי:</label>"+
                        "<input type='number' class='textPopUp' id='txtSettingsMinMounth' step='0.01' required>"+
                        "<label>מספר שעות עבודה בחודש:</label>"+
                        "<input type='number' class='textPopUp' id='txtSettingsWeekHours' step='0.01' required>"+
                        "<label>דמי נסיעות:</label>"+
                        "<input type='number' class='textPopUp' id='txtTravelDay' step='0.01' required>"+
                        "<label>ימי חופשה לפי ותק (מערך):</label>"+
                        "<input class='textPopUp' id='txtDaysHolidayArray' required>"+
                        "<label>ימי הבראה לפי ותק (מערך):</label>"+
                        "<input class='textPopUp' id='txtDaysRecoveryArray' required>"+
                        "<button id= 'buttonUpdateAdmin' class='buttonPopUp' type='button'>עדכן נתונים</button>"+
                     "</div>"+
                     "<div id='showReports' class='tabcontent'>"+
                        "<div class='form-style-9'>"+
                            "<label>חפש דוחות לפי אימייל לקוח:</label>"+
                            "<input type='text' id = 'txtFindForm' placeholder= 'אימייל'>"+
                            "<button id= 'buttonFindForm' type='button'>חפש</button>"+
                            "<div id='zoom' class='zoom'>"+
                                    "<img alt='' id='reset-zoomAdmin' height='25' src='./reset-zoom-icon.png' width='25'>"+
                                    "<img alt='' id='rotateAdmin' height='25' src='./rotate-icon.png' width='25'>"+
                                    "<img alt='' id='zoom-outAdmin' height='25' src='./zoom-out-icon.png' width='25'>"+
                                    "<img alt='' id='zoom-inAdmin' height='25' src='./zoom-in-icon.png' width='25'>"+
                            "</div>"+
                            "<div id ='container'>"+
                                "<img src='' id='loadFormAdmin' height='100%' width='100%'>"+
                            "</div>"+
                        "</div>"+       
                     "</div>";        
        $("#footerPopUp").html("");
        $("#containarPopUp").html(content);
        $("#txtSettingsMinHour").val(minHour);
        $("#txtSettingsMinMounth").val(minMonth);
        $("#txtSettingsWeekHours").val(weekHours);
        $("#txtTravelDay").val(travelDay);
        $("#txtDaysHolidayArray").val(daysHolidayArray);
        $("#txtDaysRecoveryArray").val(daysRecoveryArray);
        $('#buttonUpdateAdmin').click(updateAdminValues);
        $('#buttonFindForm').click(findEndForm);
         tabcontent = document.getElementsByClassName("tabcontent");
            tabcontent[1].style.display = "none";
        $('#defaultOpen').click(function(){
            tabcontent = document.getElementsByClassName("tabcontent");
            tabcontent[1].style.display = "none";
            tabcontent[0].style.display = "block";
            return false;
        });        
        $('#showReportsId').click(function(){
            tabcontent = document.getElementsByClassName("tabcontent");
            tabcontent[0].style.display = "none";
            tabcontent[1].style.display = "block";
            $('#zoom-inAdmin').click({msg: 'admin'},zoomIn); 
            $('#zoom-outAdmin').click({msg: 'admin'},zoomOut);
            $('#reset-zoomAdmin').click({msg: 'admin'},zoomReset);
            $('#rotateAdmin').click(rotate);   
            return false;
        });        
    }
    // פתיחת מסך התחברות למנהל 
    var buttonPopUp = function(){
        var email =$("#emailAdmin").val();
        var password = $("#passwordAdmin").val();
      firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
          adminSettings();
          }).catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            alert(errorCode);
            alert(errorMessage);
            // ...
        });
        return false;
    }
    var openPic = function(){
        var flag= false;
        var database = firebase.database();
        var leadsRef = database.ref('user');
        leadsRef.on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                if(flag == false)
                {                     
                    var childData = childSnapshot.val();
                    if(childData.status == "false")
                    {
                        flag= true;
                        var preview = document.getElementById('pic'); //selects the query named img
                        preview.src = childData.paycheck;
                        var key=childSnapshot.key;
                        database.ref("user/"+key+"/status").set("true");
                        currentEmail= childData.email;
                    }
                }
             });
             if(flag == false){
                alert("אין טופס לבדיקה"); 
                location.reload();  
             }
        });
};
    var openProgress = function(){
        var list = $("#progress");
        list.empty();
        var database = firebase.database();
        var leadsRef = database.ref('user');
        leadsRef.on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {                     
                var childData = childSnapshot.val();
                if(childData.status == "true")
                {
                    list.append(new Option(childData.email, childData.email));
                }
             });
        });
        return false;
    };

    var uploadInProgress = function(){
        var database = firebase.database();
        var leadsRef = database.ref('user');
        leadsRef.on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {                     
                var childData = childSnapshot.val();
                if($("#progress option:selected").text() == childData.email)
                {
                    currentEmail= childData.email;
                    var preview = document.getElementById('pic'); //selects the query named img
                    preview.src = childData.paycheck;
                }
             });
        });
    };

    var calc = function() {
        var goodOutPut= "נראה כי הרכיב תקין, אך לא ניתן לדעת זאת בוודאות ללא"+"<font color='blue'> בדיקה מלאה</font>";
        var hourWage = parseFloat($("#txtPayForHour").val());    // שכר לשעה
        var regularWorkHours = parseFloat($("#txtRegularWorkHours").val()); // שעות עבודה רגילות
        var regularPayment = parseFloat($("#txtRegularPayment").val()); // תשלום על שעות עבודה רגילות
        var employeePension = parseFloat($("#txtWorkerPension").val()); // הפרשת עובד לפנסיה
        var employerPension = parseFloat($("#txtEmployerPension").val()); // הפרשת מעביד לפנסיה
        var travelPayment = parseFloat($("#txtTravelPayment").val());   //נסיעות / חופי חודשי
        var daysOfWork = parseFloat($("#txtDaysOfWork").val());     // ימי עבודה
        var extraHours125Pays= parseFloat($("#txtEx125Payment").val()); // סה"כ תשלום על שעות נוספות 125
        var extraHours150Pays= parseFloat($("#txtEx150Payment").val()); // סה"כ תשלום על שעות נוספות 150
        var accumulatedDaysOff= parseFloat($("#txtAccumulatedDaysOff").val()); // מספר ימי החופשה שנצברו
        var seniorYears= parseInt($("#txtSeniorYears").val());                  // ותק בשנים
        var convalescencePay= parseFloat($("#txtConvalescencePay").val());      // דמי הבראה
        var premiumWage= parseFloat($("#txtPremiumWage").val());                // פרמיה
        var deductionsText= ($("#selectDeductions option:selected").text());        // ניכויים מלל
        var deductionsAmount= parseFloat($("#txtInvalidDeduction").val());      // ניכויים סכום
        // פער משכר מינימום
        var minWageGap = 0;
        if(hourWage<minHour)
            minWageGap = Math.round((minHour-hourWage)*regularWorkHours);
        
        // פער משכר יסוד
        var basicWageGap = 0;
        if(hourWage<minHour)
            basicWageGap=minHour*regularWorkHours-regularPayment;
        else
        {
            if(hourWage*regularWorkHours>regularPayment)
                 basicWageGap=hourWage*regularWorkHours-regularPayment;
        }
        if (basicWageGap > 0)
        {
            salaryOutPut= "נראה כי המעסיק לא שילם לך שכר בסך "+ "<font color='red'>"+Math.round(basicWageGap)+"</font>";
            outPutSum+= basicWageGap;
        }
        else
            salaryOutPut= goodOutPut;
        // פער בהפרשת פנסיה של העובד
        var employeePensionGap = 0;
        if(hourWage<minHour)
            employeePensionGap = minHour*regularWorkHours*0.06-employeePension;
        else
            employeePensionGap = hourWage*regularWorkHours*0.06-employeePension;

        
        // פער בהפרשת פנסיה של המעביד
        var employerPensionGap = 0;
         if(hourWage<minHour)
            employerPensionGap = minHour*regularWorkHours*0.125-employerPension;
        else
            employerPensionGap = hourWage*regularWorkHours*0.125-employerPension;

        // סה"כ הפסד בש"ח על בסיס דמי נסיעות
        var travelFeesLoss = 0;
        if(travelPayment<daysOfWork*travelDay)
        {
            travelFeesLoss = daysOfWork*travelDay-travelPayment;
            travelFeesOutPut= "נראה כי המעסיק לא שילם לך עבור נסיעות בסך של "+ "<font color='red'>"+Math.round(travelFeesLoss)+"₪</font>";
            outPutSum+= travelFeesLoss;
        }
        else
            travelFeesOutPut= goodOutPut;
        // סה"כ הפסד על שעות נוספות
        var extraHouresLoss= 0;
        if(regularWorkHours == 187)
            extraHouresLoss= (extraHours125Pays+extraHours150Pays)-(hourWage*1.25);
        if(regularWorkHours == 188)
             extraHouresLoss= (extraHours125Pays+extraHours150Pays)-(hourWage*1.25*2);
        if(regularWorkHours > 188)
             extraHouresLoss= (extraHours125Pays+extraHours150Pays)-(hourWage*1.25*2)+((regularWorkHours-188)*1.5*hourWage);
        if(extraHouresLoss > 0)
        {
            extraHouresOutPut=  "נראה כי המעסיק לא שילם לך שעות נוספות בסך של "+ "<font color='red'>"+Math.round(extraHouresLoss)+"₪</font>";
            outPutSum+=extraHouresLoss;
        }
        else
            extraHouresOutPut= goodOutPut;

        // ימי חופשה נוספים שמגיעים לך
        var daysOffDeserve= 0;
        var daysOffSeniority= 0;
        if(seniorYears > 14)
            daysOffSeniority= 20;
        else
            daysOffSeniority= daysHolidayArray[seniorYears-1];
        if(accumulatedDaysOff < daysOffSeniority)
            daysOffDeserve= daysOffSeniority- accumulatedDaysOff;
        if(daysOffDeserve > 0)
            daysHolidayOutPut= "נראה כי קיימים ימי חופשה נוספים שמגיעים לך בסך של "+"<font color='red'>"+ daysOffDeserve+" ימים</font>";
        else
            daysHolidayOutPut= goodOutPut;
        // הפסד כסף על חישוב הבראה לא נכון
        var daysRecoveryLoss= 0;
        var daysRecoverySeniority= 0;
        if(seniorYears > 20)
            daysRecoverySeniority= 10;
        else
            daysRecoverySeniority= daysRecoveryArray[seniorYears-1];
        if(regularWorkHours > 186)
            daysRecoveryLoss= daysRecoverySeniority*378-convalescencePay;
        else
            daysRecoveryLoss= (regularWorkHours/186)*daysRecoverySeniority*378;
        if(daysRecoveryLoss > 0)
        {
            daysRecoveryOutPut=  "נראה כי התלוש אינו כולל דמי הבראה על סך "+ "<font color='red'>"+Math.round(daysRecoveryLoss)+"₪</font>";
            outPutSum+= daysRecoveryLoss;
        }
        else
            daysRecoveryOutPut= goodOutPut;
        // פער בהפרשת פנסיה של העובד עם פרמיה
        var employeePremiumGap= 0;
        if(!(isNaN(premiumWage)))
        {
            if(hourWage < minHour)
                employeePremiumGap= (minHour*regularWorkHours+premiumWage)*0.06-employeePension;
            else
                 employeePremiumGap= (hourWage*regularWorkHours+premiumWage)*0.06-employeePension;
        }

        // פער בהפרשה פנסיה של המעביד עם פרמיה
        var employerPremiumGap= 0;
        if(!(isNaN(premiumWage)))
        {
             if(hourWage < minHour)
                employerPremiumGap= (minHour*regularWorkHours+premiumWage)*0.125-employerPension;
             else
                 employerPremiumGap= (hourWage*regularWorkHours+premiumWage)*0.125-employerPension;
        }
        // הפסד על דמי חבר וניכויים
        var deductionsLoss= 0;
        if(deductionsText == "אחר")
        {
            deductionsLoss= deductionsAmount;
            deductionsOutPut= "נראה כי הפסדת עבור ניכויים בסך של " + "<font color='red'>"+Math.round(deductionsLoss)+"₪</font>";
            outPutSum+= deductionsLoss;
        }
        else
            deductionsOutPut= goodOutPut;
        // פנסיה עובד רגילה+פרמיה
        var employeePensionSum= employeePensionGap+employeePremiumGap;
        if(employeePensionSum > 0)
        {
            employeePensionOutPut= "נראה כי המעסיק לא הפריש עבורך לפנסיה בסך של " + "<font color='red'>"+Math.round(employeePensionSum)+"₪</font>";
            outPutSum+= employeePensionSum;
        }
        else
            employeePensionOutPut= goodOutPut;
        // פנסיה הפרשת מעביד+פרמיה
        var employerPensionSum= employerPensionGap+employerPremiumGap;
        if(employerPensionSum > 0)
        {
            employerPensionOutPut= "נראה כי המעסיק לא הפריש עבורך לפנסיה בסך של " + "<font color='red'>"+Math.round(employerPensionSum)+"₪</font>";
            outPutSum+= employerPensionSum;
        }
        else 
            employerPensionOutPut= goodOutPut;

        console.log("minWageGap = "+minWageGap);
        console.log("basicWageGap = "+basicWageGap);
        console.log("employeePensionGap = "+employeePensionGap);
        console.log("employerPensionGap = "+employerPensionGap);
        console.log("travelFeesLoss = "+ travelFeesLoss);
        console.log("extraHouresLoss = "+ extraHouresLoss);
        console.log("daysOffDeserve = "+ daysOffDeserve);
        console.log("daysRecoveryLoss= "+ daysRecoveryLoss);
        console.log("employeePremiumGap= "+employeePremiumGap);
        console.log("employerPremiumGap= "+employerPremiumGap);
        console.log("deductionsLoss= "+ deductionsLoss);
        fillOutput();
    };

    var zoomIn = function(e){
        if(e.data.msg == "pic")
        {
            $('#pic').width($('#pic').width()*1.2);
            $('#pic').height($('#pic').height()*1.2);
        }
        if(e.data.msg =="admin")
        {
            $('#loadFormAdmin').width($('#loadFormAdmin').width()*1.2);
            $('#loadFormAdmin').height($('#loadFormAdmin').height()*1.2);
        }
}

    var zoomOut = function(e){
        if(e.data.msg == "pic")
        {
            $('#pic').width($('#pic').width()/1.2);
            $('#pic').height($('#pic').height()/1.2);
        }
        if(e.data.msg =="admin")
        {
            $('#loadFormAdmin').width($('#loadFormAdmin').width()/1.2);
            $('#loadFormAdmin').height($('#loadFormAdmin').height()/1.2);
        }
    }

    var zoomReset = function(e){
        if(e.data.msg == "pic")
        {
            $('#pic').width("100%");
            $('#pic').height("100%");
        }
        if(e.data.msg =="admin")
        {
            $('#loadFormAdmin').width("100%");
            $('#loadFormAdmin').height("100%");
        }    
    }

    var rotate = function(){
        img = document.getElementById('container');
        angle = (angle + 90) % 360;
        img.className = "rotate" + angle;
    }

     var previewFile = function(){
        var preview = document.getElementById('pic'); //selects the query named img
        var input = document.getElementById('fileInput');
        var file = input.files[0];
        var reader  = new FileReader();
        reader.onloadend = function () {
            preview.src = reader.result;
        }
       
        if (file) {
            reader.readAsDataURL(file); //reads the data as a URL
        } else {
            preview.src = "";
        }
   }

    var fillOutput = function(){
        var outPutSumText;
        if(outPutSum > 0)
            outPutSumText =  "<font color='red'>"+" נראה כי הנך זכאי\ת ל: "+Math.round(outPutSum)+"₪ נוספים בתלוש המשכורת כל חודש!</font>";
        else
            outPutSumText= " נראה כי תלוש המשכורת שלך תקין!";
        text=
            "<div class='output' dir='rtl'>"+
            "<img src='./labelTlushi.jpg' height='100px' width='200px'>"+
                "<table cellpadding='0' cellspacing='0' width='100%'>"+
                "<tbody>"+
                "<tr>"+
                    "<td>"+
                        "<div>"+
                            "<p align='center' style='font-size:25px;' dir='rtl'>"+
                            "תלוש השכר שלך במילים פשוטות"+
                            "</p>"+
                        "</div>"+
                    "</td>"+
                "</tr>"+
                "</tbody>"+
                "</table>"+
                "<p align='center' style='font-size:20px;' dir='rtl'>"+
                "<strong><u>מה בדקנו:</u></strong>"+
                "</p>"+
                "<div align='right' dir='rtl'>"+
    "<table dir='rtl' border='1' cellspacing='0'>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                     "<img src='./money.png' height='45px' width='45px'>"+
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "שכר"+
                    "</p>"+
                        salaryOutPut+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                     "<img src='./clock.png' height='45px' width='45px'>"+                
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "תשלום על שעות נוספות"+
                    "</p>"+
                        extraHouresOutPut+
                "</td>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                     "<img src='./car.png' height='45px' width='45px'>"+                
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "נסיעות"+
                    "</p>"+
                    "<p align='right' dir='RTL'>"+
                        travelFeesOutPut+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                   "<img src='./oldMan.jpg' height='45px' width='45px'>"+
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "הפרשה לפנסיה"+
                    "</p>"+
                    "<p align='right' dir='RTL'>"+
                        "<strong>עובד </strong>"+
                        employeePensionOutPut+
                    "</p>"+
                    "<strong>מעביד </strong>"+
                     employerPensionOutPut+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                "<img src='./undo.png' height='45px' width='45px'>"+
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "דמי הבראה"+
                    "</p>"+
                    "<p align='right' dir='RTL'>"+
                       daysRecoveryOutPut+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                     "<img src='./siz.png' height='45px' width='45px'>"+                
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "<strong>ניכויי רשות</strong>"+
                    "</p>"+
                    "<p align='right' dir='RTL'>"+
                       deductionsOutPut+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td class='tdImg' valign='top'>"+
                      "<img src='./holiday.png' height='45px' width='45px'>"+               
                "</td>"+
                "<td class='tdExp'>"+
                    "<p align='right' dir='RTL'>"+
                        "חופשה"+
                    "</p>"+
                    "<p align='right' dir='RTL'>"+
                       daysHolidayOutPut+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td width='554' colspan='2'>"+
                    "<p align='center' dir='RTL'>"+
                        "<u>סיכום</u>"+
                        outPutSumText+
                    "</p>"+
                "</td>"+
            "</tr>"+
    "</table>"+
"</div>"+
"<p dir='RTL'>"+
    "<u></u>"+
"</p>"+
 "<p align='center' style='font-size:20px;' dir='rtl'>"+
    "<strong><u>מה לא בדקנו:</u></strong>"+
"</p>"+
"<div align='right' dir='rtl'>"+
    "<table dir='rtl' border='0' cellspacing='0' cellpadding='0' width='558'>"+
        "<tbody>"+
            "<tr>"+
                "<td width='558'>"+
                    "<p align='right' dir='RTL'>"+
                        "<img src='./note.png' height='22px' width='37px'>"+
                        "<strong>אימות הנתונים והניתוח באופן ודאי ועל פי נתונים אישיים</strong>"+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td width='558'>"+
                    "<p align='right' dir='RTL'>"+
                        "<img src='./note.png' height='22px' width='37px'>"+
                        "<strong>בחינה שנתית של הניתוח</strong>"+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td width='558'>"+
                    "<p align='right' dir='RTL'>"+
                        "<img src='./note.png' height='22px' width='37px'>"+
                        "<strong>התאמה של הנתונים לדוח השעות</strong>"+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td width='558'>"+
                    "<p align='right' dir='RTL'>"+
                        "<img src='./note.png' height='22px' width='37px'>"+
                        "<strong>צבירת ימי מחלה</strong>"+
                    "</p>"+
                "</td>"+
            "</tr>"+
            "<tr>"+
                "<td width='558'>"+
                    "<p align='right' dir='RTL'>"+
                        "<img src='./note.png' height='22px' width='37px'>"+
                        "<strong>ביטוח לאומי</strong>"+
                    "</p>"+
                "</td>"+
            "</tr>"+
        "</tbody>"+
    "</table>"+
"</div>"+
"<table cellpadding='0' cellspacing='0' width='100%'>"+
    "<tbody>"+
        "<tr>"+
            "<td>"+
                "<div>"+
                    "<p align='right' dir='RTL'>"+
                        "<u>הבהרה</u>"+
                        ":"+
                    "</p>"+
                    "<p align='right' dir='RTL'>"+
                        "הנתונים המופיעים בדוח אינם מהווים ייעוץ משפטי או"+
                        " חשבונאי או ייעוץ מכל סוג שהוא, אלא סיכום של ניתוח"+
                        " נתונים המבוסס על תלוש משכורת אחד, אשר אין בידו לספק"+
                        " תמונה שלמה של זכויות העובד ומילוין על ידי המעסיק."+
                        "</br>"+
                        "ייתכן שהתלוש שנשלח מכיל סעיפים נוספים שלא נבדקו על"+
                        " ידנו, וייתכן כי בסעיפים האלה מסתתר ההפרש שמגיע לך. חשוב"+
                        " לציין, כי ציון סעיפים בצורה לא מובנת הוא עבירה על החוק"+
                        " וניתן לקבל עבורו פיצויים על פי חוק."+
                        "</br>"+                    
                        "בדיקה מהימנה ומקיפה של התלוש וזכויות העובד\ת תוכל"+
                        " להתבצע רק לאחר שליחת נתונים שנתיים מלאים."+
                        "</br>"+
                        "לשאלות ובירורים בנוגע לתוצאות ניתן לפנות אלינו במייל:"+
                        " info@tlooshy.com."+
                    "</p>"+
                "</div>"+
            "</td>"+
        "</tr>"+
    "</tbody>"+
"</table>"+
"<table cellpadding='0' cellspacing='0' width='100%'>"+
    "<tbody>"+
        "<tr>"+
            "<td>"+
                "<div>"+
                    "<p align='right' dir='RTL'>"+
                        "<u>זיהוי משתמש: "+currentEmail+"</u>"+
                    "</p>"+
                "</div>"+
            "</td>"+
        "</tr>"+
    "</tbody>"+
"</table>"+
"</div";
                "<button id = 'save' class='form-style-9'>שמור</button>"+
            "</div>";
        $("body").html(text);
        $("#save").click(function(){document.getElementById('save').style.visibility='hidden';
                                    html2canvas(document.body, {
                                        background:'#fff',
                                        onrendered: function(canvas) {
                                            var data = canvas.toDataURL("image/png", 1);
                                            window.open(data);     
                                        }
                                    }); 
        //window.print();
        document.getElementById('save').style.visibility='visible'});
    }

    return {
        initModule : initModule,
    };
}();

$(document).ready(employeeAPI.initModule);

