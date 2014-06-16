//
//  FirstViewController.h
//  Entropass
//
//  Created by Chris Clark on 5/23/14.
//  Copyright (c) 2014 Rampant Logic. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface FirstViewController : UIViewController<UITextFieldDelegate>
@property (weak, nonatomic) IBOutlet UITextField *passphrase;
@property (weak, nonatomic) IBOutlet UITextField *domain;
@property (weak, nonatomic) IBOutlet UILabel *resetCount;
@property (weak, nonatomic) IBOutlet UIStepper *resetCountControl;
@property (weak, nonatomic) IBOutlet UITextField *passwordLength;
@property (weak, nonatomic) IBOutlet UISwitch *useSymbols;
- (IBAction)showPassword:(UIButton *)sender;
@property (weak, nonatomic) IBOutlet UITextField *passwordDisplay;
- (IBAction)copyPassword:(UIButton *)sender;
@end
