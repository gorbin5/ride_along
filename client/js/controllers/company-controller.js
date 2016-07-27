/**
 * Created by I97143 on 7/21/2016.
 */
(function(){

    angular.module('companyController', [])
        
        .controller('companyController', companyController);

    companyController.$inject=["$http", "$mdDialog", "$mdMedia", "listFactory", "$timeout"];

    function companyController($http, $mdDialog, $mdMedia, listFactory, $timeout){
        var cc = this;
        
        cc.showTabDialog=showTabDialog;
        cc.openCoDetails=openCODetails;
        cc.removeCo=removeCO;
        
        cc.companies = [];
        
        cc.waitingForResponse = true;
        
        function getCompanies(){
            cc.waitingForResponse = true;
            cc.companies=[];
            $http.get('/getCompanies').then(results=> {
                var count=0;
                function pushCO(){
                    if(results.data[count]!==undefined){
                        cc.companies.push(results.data[count])
                        count+=1;
                        if(results.data[count]!==undefined){
                            $timeout(function(){
                                pushCO();
                            }, 200)
                        }
                    }
                }
                $timeout(function(){
                    console.log(results.data);
                    cc.waitingForResponse = false;
                    if(results.data.length!==0)pushCO();
                }, 750);
            }, error=>{
                if(error){
                    console.log(error);
                    cc.waitingForResponse = false;
                }
            })
        }
        getCompanies();

        function openCODetails(co){
            console.log(co);
        }
        
        function removeCO(ra){
            console.log("Trying...");
            $http.post('/removeCompany', ra).then(results=>{
                console.log("Company Removed!");
                getCompanies();
            }, error=>{
                throw error;
            })
        }

        function showTabDialog(ev){
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'templates/dialogs/company-creation-dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            }).then(function(answer) {

                }, function() {

                }
            );
        }
        
        function uniqueId(){
            var letters = ["A", "E", "I", "O", "U"];
            return Math.floor((Math.random() * 999999) + 100000) + letters[Math.floor((Math.random()*(letters.length-1)))] + Math.floor((Math.random() * 999999) + 100000);
        }

        function DialogController($scope, $mdDialog){

            $scope.addCompany=addCompany;
            $scope.addEmail=addEmail;
            $scope.assignRegions=assignRegions;
            $scope.cancel=$mdDialog.cancel;
            
            $scope.continueForm=function(){
                $scope.selectedTab=1;
            };

            $scope.selectedTab = 0;

            //Options
            $scope.regions = listFactory.regions();
            $scope.provinces = [];
            $scope.counties = [];

            //Company attributes
            $scope.name = "";
            $scope.address = "";
            $scope.phone = "";
            $scope.emails = [];
            $scope.newEmail = "";
            $scope.type="";
            $scope.region = "";
            $scope.province = "";
            $scope.county = "";

            function addCompany(){
                var id = uniqueId();
                $http.post('/addCompany',{
                    name: $scope.name,
                    address: $scope.address,
                    phone: $scope.phone,
                    emails: $scope.emails,
                    type: $scope.type,
                    id: id,
                    acceptedRideAlongs: [],
                    notifiedRideAlongs: [],
                    region: $scope.region,
                    province: $scope.province,
                    county: $scope.county
                }).then(response=>{
                    $scope.cancel();
                    getCompanies();
                    console.log("Added Company");
                }, error=>{
                    if(error){
                        console.log(error)
                    }
                })
            }

            function assignRegions(section){
                if(section=='provinces'&&$scope.region!==""){
                    for(var i=0;i<$scope.regions.length;i++){
                        if($scope.regions[i].name==$scope.region){
                            $scope.provinces=$scope.regions[i].provinces;
                            return;
                        }
                    }
                }else if(section=='counties'&&$scope.provinces!==[]&&$scope.province!==""){
                    for(var i=0;i<$scope.provinces.length;i++){
                        if($scope.provinces[i].name==$scope.province){
                            $scope.counties=$scope.provinces[i].counties;
                            return;
                        }
                    }
                }else{
                    console.log("there was an issue loading the different regions")
                }
            }
            
            function addEmail(){
                $scope.emails.push($scope.newEmail);
                $scope.newEmail="";
            }
        }
    }

})();